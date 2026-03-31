# 语音日记功能设计文档

**产品**: mood-diary-wechat  
**技术参考**: VibeVoice (Microsoft)  
**日期**: 2026-03-31

---

## 🎯 产品目标

让用户通过语音快速记录心情，AI 自动处理：
1. 转文字 + 情感分析
2. 结构化整理
3. 学习用户风格
4. 智能回顾提醒

---

## 🔧 技术架构

### 核心: VibeVoice-ASR

**优势:**
- 60 分钟单次处理（适合长语音日记）
- 自动说话人分离（多人对话场景）
- 时间戳标注（回顾时定位关键点）
- 支持自定义关键词（提升特定词汇识别）
- 50+ 语言支持（含中文）

**集成方式:**
```
语音输入 → VibeVoice-ASR API → 结构化转录 → 情感分析 → 存储
```

### 补充: VibeVoice-Realtime (可选)

- 实时语音回复（AI 情绪伴侣）
- 300ms 延迟，适合即时互动

---

## 📊 数据流设计

### 1. 语音输入处理

```typescript
interface VoiceDiaryEntry {
  id: string;
  userId: string;
  
  // 原始数据
  audioUrl: string;        // 原始语音文件
  audioDuration: number;   // 语音时长（秒）
  
  // ASR 结果
  transcript: TranscriptSegment[];
  fullText: string;        // 合并后的完整文字
  
  // AI 分析结果
  emotion: EmotionAnalysis;
  topics: string[];        // 提取的主题
  moodScore: number;       // 心情指数 (-100 ~ 100)
  
  // 元数据
  createdAt: Date;
  location?: string;       // 可选：地点
  weather?: string;        // 可选：天气
}

interface TranscriptSegment {
  speakerId: string;       // 说话人 ID
  startTime: number;       // 开始时间（秒）
  endTime: number;         // 结束时间
  text: string;            // 文字内容
  emotionHint?: string;    // 情绪线索（如语气词）
}

interface EmotionAnalysis {
  primary: string;         // 主情绪: happy, sad, anxious, calm, excited...
  secondary?: string;      // 次情绪
  confidence: number;      // 置信度
  keywords: string[];      // 情绪关键词
  intensity: number;       // 情绪强度 (0-1)
}
```

### 2. 用户风格学习

```typescript
interface UserVoiceProfile {
  userId: string;
  
  // 语言习惯
  commonPhrases: string[];     // 常用表达
  fillerWords: string[];       // 口头禅/语气词
  avgSentenceLength: number;   // 平均句子长度
  
  // 情绪模式
  emotionPatterns: {
    timeOfDay: Map<string, string[]>;    // 时间 → 常见情绪
    dayOfWeek: Map<string, string[]>;    // 星期 → 常见情绪
    triggers: Map<string, string[]>;     // 话题 → 情绪反应
  };
  
  // 历史统计
  totalEntries: number;
  avgMoodScore: number;
  moodTrend: number;           // 最近趋势 (-1下降, 0平稳, 1上升)
  
  // AI 学习参数
  lastUpdated: Date;
  modelVersion: string;
}
```

---

## 🎮 用户交互设计

### 语音纠正功能

用户可以说"改成xxx"自动修正：

```typescript
// 语音命令识别
const voiceCommands = {
  '改成': (target: string, newText: string) => editEntry(target, newText),
  '删除': (target: string) => deleteEntry(target),
  '标记重要': () => markImportant(),
  '添加标签': (tag: string) => addTag(tag),
};
```

### 一句话心情

用户说："今天很累，但是工作完成了，感觉还行"

AI 自动分析：
```
主情绪: tired → calm (疲劳转为平静)
次情绪: satisfied (满足感)
心情指数: 40 (中等偏正)
主题: work, achievement
关键词: 累, 完成, 还行
```

---

## 📅 智能回顾

### 回顾触发条件

1. **周期性**: 每周/每月自动生成回顾摘要
2. **里程碑**: 记录数达到 100/500/1000 条
3. **情绪变化**: 检测到显著情绪趋势变化
4. **用户请求**: 用户说"回顾一下最近"

### 回顾内容

```typescript
interface DiaryReview {
  period: { start: Date; end: Date };
  
  // 统计
  totalEntries: number;
  dominantEmotions: string[];
  avgMoodScore: number;
  
  // 高光时刻
  highlights: {
    happiest: DiaryEntry;
    mostReflective: DiaryEntry;
    breakthroughMoments: DiaryEntry[];  // 情绪好转的关键点
  };
  
  // AI 洞察
  insights: string[];         // 如"你最近焦虑减少，可能与运动增加有关"
  
  // 建议
  suggestions: string[];      // 正向行为建议
  
  // 生成方式
  generatedAt: Date;
  byAI: boolean;
}
```

---

## 🔄 与 Agent Memory System 集成

语音日记作为 Memory 的数据源：

```typescript
// 使用 agent-memory-system SDK
import { MemoryClient } from '@openclaw/agent-memory-system';

const memoryClient = new MemoryClient({
  agentId: 'mood-diary-agent',
  userId: userId,
});

// 每次日记记录后，自动创建 Memory
async function onDiaryEntry(entry: VoiceDiaryEntry) {
  await memoryClient.recordObservation({
    type: 'voice-diary',
    content: entry.fullText,
    metadata: {
      emotion: entry.emotion.primary,
      moodScore: entry.moodScore,
      topics: entry.topics,
    },
    importance: entry.moodScore < -50 ? 'high' : 'normal',
  });
}
```

---

## 🚀 实施路径

### Phase 1: MVP（2-3 天）

- 集成 VibeVoice-ASR API
- 基础语音转文字
- 情感分析（简单关键词匹配）
- 存储 + 展示

### Phase 2: 增强（1 周）

- 语音纠正命令
- 用户风格学习
- Agent Memory 集成

### Phase 3: 智能（2 周）

- AI 回顾生成
- 情绪趋势分析
- 个性化建议

---

## 🔗 相关资源

- VibeVoice GitHub: https://github.com/microsoft/VibeVoice
- VibeVoice-ASR 文档: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-asr.md
- Playground: https://aka.ms/vibevoice-asr
- HuggingFace: https://huggingface.co/microsoft/VibeVoice-ASR

---

## 💡 后续创意

1. **语音情绪伴侣**: 用 VibeVoice-Realtime 实现即时语音回复
2. **多人日记**: 支持家庭/情侣共同记录
3. **语音日记导出**: 生成播客风格的回顾音频
4. **跨平台**: 从微信扩展到其他平台