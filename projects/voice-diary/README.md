# Voice Diary SDK

语音日记系统，集成 VibeVoice ASR + 情感分析 + Agent Memory。

## 功能

- 🎤 **语音转文字**: 支持 VibeVoice-ASR（60 分钟长音频）
- 😊 **情感分析**: 自动识别情绪 + 计算心情指数
- 📊 **用户风格学习**: 分析语言习惯和情绪模式
- ✏️ **语音纠正**: 说"改成xxx"自动修正内容
- 📖 **智能回顾**: 生成周期性心情回顾
- 🧠 **Memory 集成**: 自动记录到 Agent Memory System

## 快速开始

```typescript
import { VoiceDiaryClient } from 'voice-diary-sdk';

const client = new VoiceDiaryClient({
  userId: 'user_001',
  asr: {
    hotwords: ['项目', '会议'],  // 自定义关键词
  },
});

// 记录语音日记
const entry = await client.record('/path/to/audio.wav');

console.log(`情绪: ${entry.emotion.primary}`);
console.log(`心情指数: ${entry.moodScore}`);
console.log(`主题: ${entry.topics.join(', ')}`);
```

## 文字快速记录（测试用）

```typescript
const entry = await client.quickRecord('今天很开心，完成了项目！');

// {
//   emotion: { primary: 'happy', intensity: 0.6 },
//   moodScore: 42,
//   topics: ['work']
// }
```

## 语音纠正

```typescript
// 用户说"改成完成了工作"
client.applyCorrection(entry.id, {
  command: 'edit',
  target: '完成了项目',
  newValue: '完成了工作',
});
```

## 智能回顾

```typescript
const review = client.generateReview(
  new Date('2026-03-01'),
  new Date('2026-03-31')
);

console.log(review.insights);     // AI 洞察
console.log(review.suggestions);  // 正向建议
```

## API

### VoiceDiaryClient

| 方法 | 说明 |
|------|------|
| `record(audioPath)` | 录制语音日记 |
| `quickRecord(text)` | 快速文字记录 |
| `applyCorrection(entryId, correction)` | 应用语音纠正 |
| `getProfile()` | 获取用户风格档案 |
| `getEntries(limit?)` | 获取历史记录 |
| `generateReview(start, end)` | 生成回顾报告 |

## 数据结构

### VoiceDiaryEntry

```typescript
interface VoiceDiaryEntry {
  id: string;
  userId: string;
  fullText: string;          // 转录文字
  emotion: EmotionAnalysis;  // 情感分析结果
  topics: string[];          // 提取的主题
  moodScore: number;         // 心情指数 (-100 ~ 100)
  createdAt: Date;
}
```

### EmotionAnalysis

```typescript
interface EmotionAnalysis {
  primary: EmotionType;      // 主情绪
  secondary?: EmotionType;   // 次情绪
  confidence: number;        // 置信度 (0-1)
  keywords: string[];        // 情绪关键词
  intensity: number;         // 情绪强度 (0-1)
}
```

## 支持的情绪类型

| 正向 | 中性 | 负向 |
|------|------|------|
| happy | neutral | sad |
| grateful | calm | anxious |
| hopeful | tired | lonely |
| excited | | frustrated |
| | | angry |

## 技术栈

- **ASR**: VibeVoice-ASR (Microsoft)
- **存储**: SQLite（可选）
- **Memory**: Agent Memory System SDK

## 后续开发

- [ ] 集成真实 VibeVoice API
- [ ] SQLite 持久存储
- [ ] AI 模型情感分析
- [ ] 实时语音回复（VibeVoice-Realtime）
- [ ] 微信小程序集成