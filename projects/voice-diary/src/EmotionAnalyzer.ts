/**
 * Emotion Analyzer - Text to Emotion
 * 
 * Analyzes text for emotional content using:
 * 1. Keyword matching (fast, MVP)
 * 2. AI model integration (future)
 */

import type { EmotionAnalysis, EmotionType } from './index.ts';

// Emotion keyword mappings (Chinese)
const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  happy: ['开心', '高兴', '快乐', '幸福', '棒', '好', '喜欢', '爱', '满足', '哈哈哈', '嘻嘻'],
  sad: ['难过', '伤心', '悲伤', '失落', '失望', '泪', '哭', '遗憾', '可惜'],
  anxious: ['焦虑', '担心', '紧张', '害怕', '恐惧', '不安', '忧虑', '纠结'],
  calm: ['平静', '放松', '安宁', '淡定', '冷静', '沉稳'],
  excited: ['激动', '兴奋', '期待', '迫不及待', '太好了', '哇'],
  angry: ['生气', '愤怒', '烦', '讨厌', '厌恶', '无语', '崩溃'],
  neutral: ['一般', '还行', '普通', '正常', '没什么'],
  tired: ['累', '疲惫', '困', '倦', '乏力', '没劲', '辛苦'],
  grateful: ['感谢', '谢谢', '感恩', '感激', '幸运', '幸好'],
  lonely: ['孤独', '寂寞', '孤单', '一个人', '没人'],
  hopeful: ['希望', '期待', '相信', '会好的', '加油', '努力'],
  frustrated: ['挫败', '沮丧', '无助', '不知道怎么办', '烦死了'],
};

// Emotion intensity modifiers
const INTENSITY_MODIFIERS = {
  strong: ['非常', '特别', '超级', '极其', '太'],
  weak: ['有点', '稍微', '一些', '略微'],
};

export interface EmotionAnalyzerConfig {
  // Use AI model for deeper analysis
  useAI?: boolean;
  aiModel?: string;
  
  // Custom keywords
  customKeywords?: Record<EmotionType, string[]>;
  
  // Minimum confidence threshold
  minConfidence?: number;
}

export class EmotionAnalyzer {
  private keywords: Record<EmotionType, string[]>;
  private config: EmotionAnalyzerConfig;
  
  constructor(config: EmotionAnalyzerConfig = {}) {
    this.config = config;
    this.keywords = { ...EMOTION_KEYWORDS, ...config.customKeywords };
  }
  
  /**
   * Analyze text for emotions
   */
  analyze(text: string): EmotionAnalysis {
    // Fast keyword-based analysis for MVP
    const matches = this.findKeywordMatches(text);
    
    // Calculate primary emotion
    const sorted = Object.entries(matches)
      .sort((a, b) => b[1].score - a[1].score);
    
    if (sorted.length === 0 || sorted[0][1].score === 0) {
      return {
        primary: 'neutral',
        confidence: 0.5,
        keywords: [],
        intensity: 0.3,
      };
    }
    
    const [primaryEmotion, primaryMatch] = sorted[0];
    const secondaryMatch = sorted[1]?.[1]?.score > 0 ? sorted[1] : null;
    
    // Calculate intensity
    const intensity = this.calculateIntensity(text, primaryMatch.keywords);
    
    // Calculate confidence
    const confidence = Math.min(primaryMatch.score / 5, 1);
    
    return {
      primary: primaryEmotion as EmotionType,
      secondary: secondaryMatch?.[0] as EmotionType | undefined,
      confidence,
      keywords: primaryMatch.keywords,
      intensity,
    };
  }
  
  /**
   * Calculate mood score from emotion
   * 
   * @param emotion - Primary emotion
   * @param intensity - Emotion intensity (0-1)
   * @returns Score from -100 to 100
   */
  calculateMoodScore(emotion: EmotionAnalysis): number {
    // Emotion base scores
    const BASE_SCORES: Record<EmotionType, number> = {
      happy: 70,
      grateful: 65,
      hopeful: 50,
      excited: 60,
      calm: 40,
      neutral: 0,
      tired: -20,
      frustrated: -40,
      anxious: -50,
      lonely: -60,
      sad: -70,
      angry: -80,
    };
    
    const baseScore = BASE_SCORES[emotion.primary] || 0;
    const intensityFactor = emotion.intensity;
    
    // Apply intensity
    const score = baseScore * intensityFactor;
    
    // Clamp to -100 to 100
    return Math.max(-100, Math.min(100, Math.round(score)));
  }
  
  /**
   * Extract topics from text
   */
  extractTopics(text: string): string[] {
    // Simple topic extraction based on keywords
    const topicKeywords = {
      work: ['工作', '上班', '公司', '项目', '任务', '开会', '加班'],
      family: ['家人', '爸妈', '孩子', '老婆', '老公', '家里'],
      health: ['身体', '健康', '生病', '医院', '运动', '健身'],
      social: ['朋友', '聚会', '社交', '聊天', '出去玩'],
      learning: ['学习', '读书', '上课', '技能', '知识'],
      finance: ['钱', '收入', '花费', '投资', '理财'],
      travel: ['旅游', '出行', '度假', '旅行'],
    };
    
    const topics: string[] = [];
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        topics.push(topic);
      }
    }
    
    return topics;
  }
  
  /**
   * Find keyword matches in text
   */
  private findKeywordMatches(text: string): Record<EmotionType, { score: number; keywords: string[] }> {
    const matches: Record<EmotionType, { score: number; keywords: string[] }> = {} as any;
    
    for (const [emotion, keywords] of Object.entries(this.keywords)) {
      const found = keywords.filter(kw => text.includes(kw));
      if (found.length > 0) {
        matches[emotion as EmotionType] = {
          score: found.length,
          keywords: found,
        };
      }
    }
    
    return matches;
  }
  
  /**
   * Calculate intensity from modifiers
   */
  private calculateIntensity(text: string, matchedKeywords: string[]): number {
    // Check for intensity modifiers
    const hasStrong = INTENSITY_MODIFIERS.strong.some(m => text.includes(m));
    const hasWeak = INTENSITY_MODIFIERS.weak.some(m => text.includes(m));
    
    if (hasStrong) return 0.9;
    if (hasWeak) return 0.4;
    
    // Default intensity based on keyword count
    return Math.min(0.3 + matchedKeywords.length * 0.15, 0.8);
  }
}