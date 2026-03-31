/**
 * Voice Diary Example - Demo Usage
 */

import { VoiceDiaryClient } from './VoiceDiaryClient.ts';

async function main() {
  console.log('=== Voice Diary MVP Demo ===\n');
  
  // Initialize client
  const client = new VoiceDiaryClient({
    userId: 'user_demo',
    asr: {
      hotwords: ['项目', '加班', '会议'],
    },
  });
  
  // Simulate voice entries (using text for demo)
  console.log('📝 Recording entries...\n');
  
  const entry1 = await client.quickRecord(
    '今天感觉很累，但是工作终于完成了。虽然过程很艰难，但结果还不错。'
  );
  console.log(`Entry 1: ${entry1.emotion.primary}, score: ${entry1.moodScore}`);
  
  const entry2 = await client.quickRecord(
    '明天要去开会，有点紧张，但也很期待。'
  );
  console.log(`Entry 2: ${entry2.emotion.primary}, score: ${entry2.moodScore}`);
  
  const entry3 = await client.quickRecord(
    '晚上和朋友聊天，很开心，放松了很多。'
  );
  console.log(`Entry 3: ${entry3.emotion.primary}, score: ${entry3.moodScore}`);
  
  const entry4 = await client.quickRecord(
    '最近学习新技能，感觉很有成就感！'
  );
  console.log(`Entry 4: ${entry4.emotion.primary}, score: ${entry4.moodScore}`);
  
  // Get profile
  console.log('\n📊 User Profile:');
  const profile = client.getProfile();
  console.log(`Total entries: ${profile.totalEntries}`);
  console.log(`Avg mood score: ${profile.avgMoodScore}`);
  console.log(`Emotion patterns: ${JSON.stringify(profile.emotionPatterns, null, 2)}`);
  
  // Generate review
  console.log('\n📖 Weekly Review:');
  const review = client.generateReview(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  );
  console.log(`Total entries: ${review.totalEntries}`);
  console.log(`Dominant emotions: ${review.dominantEmotions.join(', ')}`);
  console.log(`Insights: ${review.insights.join('\n  - ')}`);
  console.log(`Suggestions: ${review.suggestions.join('\n  - ')}`);
  
  // Test correction
  console.log('\n✏️ Voice Correction Demo:');
  const corrected = client.applyCorrection(entry1.id, {
    timestamp: new Date(),
    command: 'edit',
    target: '很艰难',
    newValue: '很有挑战',
  });
  console.log(`Corrected text: ${corrected.fullText}`);
  
  console.log('\n✅ Demo complete!');
}

main().catch(console.error);