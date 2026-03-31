/**
 * Voice Diary Client - Main API
 * 
 * Integrates ASR + Emotion Analysis + Memory System
 */

import { ASRClient } from './ASRClient.ts';
import { EmotionAnalyzer } from './EmotionAnalyzer.ts';
import type {
  VoiceDiaryEntry,
  VoiceCorrection,
  UserVoiceProfile,
  DiaryReview,
  TranscriptSegment,
} from './index.ts';

// Simple ID generator
const generateId = () => `diary_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export interface VoiceDiaryConfig {
  userId: string;
  
  // ASR config
  asr?: {
    hotwords?: string[];
    language?: string;
  };
  
  // Storage (for MVP, in-memory)
  storage?: 'memory' | 'sqlite';
  
  // Memory system integration
  memorySystem?: {
    enabled: boolean;
    agentId?: string;
  };
}

export class VoiceDiaryClient {
  private userId: string;
  private asrClient: ASRClient;
  private emotionAnalyzer: EmotionAnalyzer;
  private entries: VoiceDiaryEntry[] = [];
  private profile: UserVoiceProfile;
  private corrections: Map<string, VoiceCorrection[]> = new Map();
  
  constructor(config: VoiceDiaryConfig) {
    this.userId = config.userId;
    
    this.asrClient = new ASRClient({
      hotwords: config.asr?.hotwords,
      language: config.asr?.language || 'zh-CN',
    });
    
    this.emotionAnalyzer = new EmotionAnalyzer();
    
    // Initialize user profile
    this.profile = {
      userId: this.userId,
      commonPhrases: [],
      fillerWords: [],
      avgSentenceLength: 0,
      emotionPatterns: {
        timeOfDay: {},
        dayOfWeek: {},
        triggers: {},
      },
      totalEntries: 0,
      avgMoodScore: 0,
      moodTrend: 0,
      lastUpdated: new Date(),
    };
  }
  
  /**
   * Record a voice diary entry
   * 
   * @param audioPath - Path to audio file
   * @returns Diary entry with analysis
   */
  async record(audioPath: string): Promise<VoiceDiaryEntry> {
    // 1. Transcribe audio
    const asrResult = await this.asrClient.transcribe(audioPath);
    
    // 2. Analyze emotion
    const emotion = this.emotionAnalyzer.analyze(asrResult.fullText);
    
    // 3. Calculate mood score
    const moodScore = this.emotionAnalyzer.calculateMoodScore(emotion);
    
    // 4. Extract topics
    const topics = this.emotionAnalyzer.extractTopics(asrResult.fullText);
    
    // 5. Create entry
    const entry: VoiceDiaryEntry = {
      id: generateId(),
      userId: this.userId,
      audioDuration: asrResult.duration,
      transcript: asrResult.segments,
      fullText: asrResult.fullText,
      emotion,
      topics,
      moodScore,
      createdAt: new Date(),
    };
    
    // 6. Store entry
    this.entries.push(entry);
    
    // 7. Update user profile
    this.updateProfile(entry);
    
    console.log(`[Voice Diary] Recorded entry: ${entry.id}`);
    console.log(`[Voice Diary] Emotion: ${emotion.primary} (${emotion.intensity})`);
    console.log(`[Voice Diary] Mood score: ${moodScore}`);
    
    return entry;
  }
  
  /**
   * Quick text entry (for testing without audio)
   */
  async quickRecord(text: string): Promise<VoiceDiaryEntry> {
    const emotion = this.emotionAnalyzer.analyze(text);
    const moodScore = this.emotionAnalyzer.calculateMoodScore(emotion);
    const topics = this.emotionAnalyzer.extractTopics(text);
    
    const entry: VoiceDiaryEntry = {
      id: generateId(),
      userId: this.userId,
      audioDuration: 0,
      transcript: [{
        speakerId: 'user',
        startTime: 0,
        endTime: 5,
        text,
      }],
      fullText: text,
      emotion,
      topics,
      moodScore,
      createdAt: new Date(),
    };
    
    this.entries.push(entry);
    this.updateProfile(entry);
    
    return entry;
  }
  
  /**
   * Apply voice correction command
   * 
   * User can say "改成xxx" to edit previous entry
   */
  applyCorrection(entryId: string, correction: VoiceCorrection): VoiceDiaryEntry {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) {
      throw new Error(`Entry not found: ${entryId}`);
    }
    
    // Record correction
    entry.corrections = [...(entry.corrections || []), correction];
    
    // Apply correction
    switch (correction.command) {
      case 'edit':
        if (correction.target && correction.newValue) {
          entry.fullText = entry.fullText.replace(correction.target, correction.newValue);
        }
        break;
      
      case 'add_tag':
        if (correction.newValue) {
          entry.topics = [...entry.topics, correction.newValue];
        }
        break;
      
      case 'mark_important':
        entry.moodScore = Math.abs(entry.moodScore) + 20;  // Boost importance
        break;
      
      case 'delete':
        // Remove entry
        this.entries = this.entries.filter(e => e.id !== entryId);
        break;
    }
    
    // Re-analyze emotion after edit
    if (correction.command === 'edit') {
      entry.emotion = this.emotionAnalyzer.analyze(entry.fullText);
      entry.moodScore = this.emotionAnalyzer.calculateMoodScore(entry.emotion);
    }
    
    return entry;
  }
  
  /**
   * Get user profile
   */
  getProfile(): UserVoiceProfile {
    return this.profile;
  }
  
  /**
   * Get entries
   */
  getEntries(limit?: number): VoiceDiaryEntry[] {
    if (limit) {
      return this.entries.slice(-limit);
    }
    return this.entries;
  }
  
  /**
   * Generate review for a time period
   */
  generateReview(startDate: Date, endDate: Date): DiaryReview {
    const entries = this.entries.filter(
      e => e.createdAt >= startDate && e.createdAt <= endDate
    );
    
    if (entries.length === 0) {
      return {
        period: { start: startDate, end: endDate },
        totalEntries: 0,
        dominantEmotions: [],
        avgMoodScore: 0,
        highlights: { breakthroughMoments: [] },
        insights: ['这段时间没有记录'],
        suggestions: ['试着每天记录一下心情'],
        generatedAt: new Date(),
      };
    }
    
    // Calculate statistics
    const emotionCounts: Record<string, number> = {};
    let totalMoodScore = 0;
    
    entries.forEach(e => {
      emotionCounts[e.emotion.primary] = (emotionCounts[e.emotion.primary] || 0) + 1;
      totalMoodScore += e.moodScore;
    });
    
    const dominantEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion as any);
    
    // Find highlights
    const happiest = entries.find(e => e.moodScore === Math.max(...entries.map(en => en.moodScore)));
    
    // Generate insights
    const avgMood = totalMoodScore / entries.length;
    const insights = this.generateInsights(entries, avgMood, dominantEmotions);
    
    return {
      period: { start: startDate, end: endDate },
      totalEntries: entries.length,
      dominantEmotions,
      avgMoodScore: Math.round(avgMood),
      highlights: {
        happiest,
        breakthroughMoments: entries.filter(e => 
          e.emotion.primary === 'hopeful' || e.emotion.primary === 'grateful'
        ).slice(0, 3),
      },
      insights,
      suggestions: this.generateSuggestions(avgMood, dominantEmotions),
      generatedAt: new Date(),
    };
  }
  
  /**
   * Update user profile based on entry
   */
  private updateProfile(entry: VoiceDiaryEntry): void {
    this.profile.totalEntries++;
    
    // Update average mood score
    const oldAvg = this.profile.avgMoodScore;
    const n = this.profile.totalEntries;
    this.profile.avgMoodScore = Math.round((oldAvg * (n - 1) + entry.moodScore) / n);
    
    // Update emotion patterns
    const hour = entry.createdAt.getHours();
    const hourKey = `${hour}-${hour + 1}`;
    const dayKey = entry.createdAt.toLocaleDateString('zh-CN', { weekday: 'long' });
    
    if (!this.profile.emotionPatterns.timeOfDay[hourKey]) {
      this.profile.emotionPatterns.timeOfDay[hourKey] = [];
    }
    this.profile.emotionPatterns.timeOfDay[hourKey].push(entry.emotion.primary);
    
    if (!this.profile.emotionPatterns.dayOfWeek[dayKey]) {
      this.profile.emotionPatterns.dayOfWeek[dayKey] = [];
    }
    this.profile.emotionPatterns.dayOfWeek[dayKey].push(entry.emotion.primary);
    
    // Track topic triggers
    entry.topics.forEach(topic => {
      if (!this.profile.emotionPatterns.triggers[topic]) {
        this.profile.emotionPatterns.triggers[topic] = [];
      }
      this.profile.emotionPatterns.triggers[topic].push(entry.emotion.primary);
    });
    
    // Update average sentence length
    const avgLen = entry.fullText.length / entry.transcript.length;
    this.profile.avgSentenceLength = (this.profile.avgSentenceLength + avgLen) / 2;
    
    this.profile.lastUpdated = new Date();
  }
  
  /**
   * Generate insights from entries
   */
  private generateInsights(
    entries: VoiceDiaryEntry[],
    avgMood: number,
    emotions: string[]
  ): string[] {
    const insights: string[] = [];
    
    // Mood trend
    if (avgMood > 30) {
      insights.push('这段时间心情整体不错，继续保持！');
    } else if (avgMood < -30) {
      insights.push('这段时间情绪偏低，可能需要关注一下');
    }
    
    // Pattern insights
    const workRelated = entries.filter(e => e.topics.includes('work'));
    if (workRelated.length > entries.length * 0.5) {
      insights.push('工作话题占比较高，可能需要更多生活平衡');
    }
    
    // Emotion patterns
    if (emotions.includes('tired') && emotions.includes('anxious')) {
      insights.push('疲劳和焦虑并存，建议注意休息');
    }
    
    return insights;
  }
  
  /**
   * Generate suggestions
   */
  private generateSuggestions(avgMood: number, emotions: string[]): string[] {
    const suggestions: string[] = [];
    
    if (avgMood < 0) {
      suggestions.push('试着记录一些积极的事情');
      suggestions.push('每天花5分钟反思一下');
    }
    
    if (emotions.includes('tired')) {
      suggestions.push('注意休息，保证睡眠质量');
    }
    
    if (emotions.includes('anxious')) {
      suggestions.push('尝试一些放松活动，如冥想或散步');
    }
    
    if (avgMood > 50) {
      suggestions.push('继续保持积极心态！');
      suggestions.push('分享你的快乐给身边的人');
    }
    
    return suggestions;
  }
}