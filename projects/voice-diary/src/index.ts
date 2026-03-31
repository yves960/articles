/**
 * Voice Diary SDK - Core Types
 * 
 * Based on VibeVoice for ASR, with emotion analysis and memory integration.
 */

// === Core Types ===

export interface VoiceDiaryEntry {
  id: string;
  userId: string;
  
  // Original audio
  audioUrl?: string;
  audioDuration: number;  // seconds
  
  // ASR result
  transcript: TranscriptSegment[];
  fullText: string;
  
  // AI analysis
  emotion: EmotionAnalysis;
  topics: string[];
  moodScore: number;  // -100 to 100
  
  // Metadata
  createdAt: Date;
  location?: string;
  weather?: string;
  
  // Voice correction history
  corrections?: VoiceCorrection[];
}

export interface TranscriptSegment {
  speakerId: string;
  startTime: number;  // seconds
  endTime: number;
  text: string;
  emotionHint?: string;
}

export interface EmotionAnalysis {
  primary: EmotionType;
  secondary?: EmotionType;
  confidence: number;  // 0-1
  keywords: string[];
  intensity: number;  // 0-1
}

export type EmotionType = 
  | 'happy' | 'sad' | 'anxious' | 'calm' 
  | 'excited' | 'angry' | 'neutral' | 'tired'
  | 'grateful' | 'lonely' | 'hopeful' | 'frustrated';

export interface VoiceCorrection {
  timestamp: Date;
  command: 'edit' | 'delete' | 'add_tag' | 'mark_important';
  target?: string;
  newValue?: string;
}

export interface UserVoiceProfile {
  userId: string;
  
  // Language patterns
  commonPhrases: string[];
  fillerWords: string[];
  avgSentenceLength: number;
  
  // Emotion patterns
  emotionPatterns: {
    timeOfDay: Record<string, EmotionType[]>;
    dayOfWeek: Record<string, EmotionType[]>;
    triggers: Record<string, EmotionType[]>;
  };
  
  // Stats
  totalEntries: number;
  avgMoodScore: number;
  moodTrend: number;  // -1, 0, 1
  
  lastUpdated: Date;
}

export interface DiaryReview {
  period: { start: Date; end: Date };
  
  totalEntries: number;
  dominantEmotions: EmotionType[];
  avgMoodScore: number;
  
  highlights: {
    happiest?: VoiceDiaryEntry;
    mostReflective?: VoiceDiaryEntry;
    breakthroughMoments: VoiceDiaryEntry[];
  };
  
  insights: string[];
  suggestions: string[];
  
  generatedAt: Date;
}