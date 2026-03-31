/**
 * Agent Memory System - Example Usage
 */

import { MemoryClient } from './MemoryClient.js';
import type { MemoryConfig } from './index.js';

async function main() {
  // 1. Initialize the memory client
  const config: MemoryConfig = {
    agentId: 'example-agent',
    projectId: 'demo-project',
    storage: {
      type: 'sqlite',
      path: './memory.db',
    },
    vector: {
      type: 'none',  // Use 'chroma' for semantic search
    },
    hooks: {
      onSessionStart: async (session) => {
        console.log(`📝 Session started: ${session.id}`);
      },
      onSessionEnd: async (session, summary) => {
        console.log(`✅ Session ended: ${session.id}`);
        console.log(`   Learned: ${summary.learned}`);
      },
      onToolUse: async (toolName, input, result, session) => {
        console.log(`🔧 Tool used: ${toolName}`);
      },
    },
  };
  
  const memory = new MemoryClient(config);
  await memory.initialize();
  
  console.log('🚀 Agent Memory System initialized\n');
  
  // 2. Start a session
  const session = await memory.startSession({
    userPrompt: '帮我分析用户行为数据，找出活跃度下降的原因',
    metadata: { source: 'slack', channel: '#analytics' },
  });
  
  console.log(`Session: ${session.id}\n`);
  
  // 3. Record observations (simulating tool use)
  await memory.recordObservation({
    sessionId: session.id,
    type: 'discovery',
    title: '发现用户行为模式',
    text: '分析发现用户在周末的活跃度明显下降，可能与工作日使用习惯有关',
    facts: [
      '周末活跃度下降 40%',
      '主要使用时段为工作日 9-18 点',
      '移动端用户受影响更大',
    ],
    concepts: ['用户行为', '活跃度分析', '时间模式'],
    filesRead: ['data/user_activity.csv', 'data/user_sessions.json'],
    tokensUsed: 1500,
  });
  
  // 4. Simulate tool use
  await memory.recordToolUse('bash', 
    { command: 'python analyze.py --date-range 2026-03' },
    { exitCode: 0, stdout: 'Analysis complete' },
    session.id
  );
  
  await memory.recordToolUse('write_file',
    { path: 'reports/activity_analysis.md' },
    { success: true },
    session.id
  );
  
  // 5. End the session
  await memory.endSession(session.id, {
    status: 'completed',
    summary: {
      request: '分析用户行为数据，找出活跃度下降的原因',
      investigated: '分析了 2026年3月的用户行为数据',
      learned: '用户周末活跃度下降 40%，主要受工作习惯影响',
      completed: '生成了详细的分析报告',
      nextSteps: '建议进行用户调研，了解周末使用的具体场景',
      filesRead: ['data/user_activity.csv', 'data/user_sessions.json'],
      filesEdited: ['reports/activity_analysis.md'],
      totalTokens: 3500,
    },
  });
  
  // 6. Search for relevant memories
  console.log('\n🔍 Searching for relevant memories...\n');
  
  const searchResult = await memory.search({
    agentId: 'example-agent',
    type: ['discovery', 'decision'],
    limit: 5,
  });
  
  console.log(`Found ${searchResult.observations.length} observations:`);
  for (const obs of searchResult.observations) {
    console.log(`  - [${obs.type}] ${obs.title}: ${obs.text.slice(0, 50)}...`);
  }
  
  // 7. Get context for a new query
  console.log('\n📚 Getting context for new query...\n');
  
  const context = await memory.getContext({
    query: '周末用户活跃度如何提升',
    maxTokens: 1000,
    includeRecent: true,
    includeImportant: true,
  });
  
  console.log(`Context (${context.totalTokens} tokens):`);
  console.log(`  - ${context.memories.length} memories`);
  console.log(`  - ${context.recentObservations.length} recent observations`);
  
  // 8. Show stats
  const stats = await memory.getStats();
  console.log('\n📊 Stats:');
  console.log(`  - Total sessions: ${stats.totalSessions}`);
  console.log(`  - Total observations: ${stats.totalObservations}`);
  console.log(`  - Total memories: ${stats.totalMemories}`);
  
  // 9. Cleanup
  await memory.shutdown();
  console.log('\n👋 Done!');
}

main().catch(console.error);