/**
 * AI Status HUD - Example Usage
 */

import { AIStatusHUD } from './AIStatusHUD.ts';

async function main() {
  console.log('=== AI Status HUD Demo ===\n');
  
  // Initialize HUD
  const hud = new AIStatusHUD({
    maxTimelineEntries: 8,
    autoExpandThreshold: 3,
    outputMode: 'terminal',
  });
  
  // Set update callback
  hud.onUpdateCallback((output) => {
    // Could send to WebSocket here
  });
  
  // Start a task
  hud.startTask('task_001', '实现 Agent Memory System');
  
  // Simulate workflow
  await simulateWork(hud);
  
  console.log('\n✅ Demo complete!');
}

async function simulateWork(hud: AIStatusHUD): Promise<void> {
  // Phase: Init
  hud.setPhase('init', 100);
  await delay(500);
  
  // Phase: Decompose
  hud.setPhase('decompose');
  hud.setAction('分析任务需求...');
  hud.recordDecision('拆分为 3 个子任务', '任务复杂度为中等');
  await delay(800);
  
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'pending', progress: 0, agent: '金克丝' },
    { id: 'st2', name: '编写代码', status: 'pending', progress: 0, agent: '艾克' },
    { id: 'st3', name: '编写测试', status: 'pending', progress: 0, agent: '凯特琳' },
  ]);
  
  hud.setPhase('decompose', 100);
  await delay(500);
  
  // Phase: Execute
  hud.setPhase('execute');
  
  // Subtask 1
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'running', progress: 20, agent: '金克丝' },
    { id: 'st2', name: '编写代码', status: 'pending', progress: 0, agent: '艾克' },
    { id: 'st3', name: '编写测试', status: 'pending', progress: 0, agent: '凯特琳' },
  ]);
  
  hud.recordFileRead('claude-mem/README.md', 120);
  hud.updateTokens(2340);
  await delay(600);
  
  hud.recordDecision('使用 SQLite + Chroma 架构');
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'running', progress: 60, agent: '金克丝' },
    { id: 'st2', name: '编写代码', status: 'pending', progress: 0, agent: '艾克' },
    { id: 'st3', name: '编写测试', status: 'pending', progress: 0, agent: '凯特琳' },
  ]);
  await delay(600);
  
  hud.recordFileWrite('DESIGN.md', 180);
  hud.updateTokens(4520);
  
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'completed', progress: 100, agent: '金克丝', duration: 2 },
    { id: 'st2', name: '编写代码', status: 'running', progress: 10, agent: '艾克' },
    { id: 'st3', name: '编写测试', status: 'pending', progress: 0, agent: '凯特琳' },
  ]);
  await delay(400);
  
  // Subtask 2
  hud.recordFileRead('claude-mem/src/index.ts', 90);
  hud.updateTokens(5670);
  await delay(500);
  
  hud.recordToolCall('edit', { file: 'MemoryClient.ts', old: '...', new: '...' }, 350);
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'completed', progress: 100, agent: '金克丝', duration: 2 },
    { id: 'st2', name: '编写代码', status: 'running', progress: 40, agent: '艾克' },
    { id: 'st3', name: '编写测试', status: 'pending', progress: 0, agent: '凯特琳' },
  ]);
  hud.updateTokens(7890);
  await delay(500);
  
  hud.recordFileWrite('src/MemoryClient.ts', 220);
  hud.recordFileWrite('src/MemoryStore.ts', 180);
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'completed', progress: 100, agent: '金克丝', duration: 2 },
    { id: 'st2', name: '编写代码', status: 'running', progress: 70, agent: '艾克' },
    { id: 'st3', name: '编写测试', status: 'pending', progress: 0, agent: '凯特琳' },
  ]);
  hud.updateTokens(9230);
  await delay(500);
  
  hud.recordToolCall('exec', { command: 'bun build' }, 450, { success: true });
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'completed', progress: 100, agent: '金克丝', duration: 2 },
    { id: 'st2', name: '编写代码', status: 'completed', progress: 100, agent: '艾克', duration: 3 },
    { id: 'st3', name: '编写测试', status: 'running', progress: 30, agent: '凯特琳' },
  ]);
  await delay(400);
  
  // Subtask 3
  hud.recordFileWrite('src/tests/memory.test.ts', 150);
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'completed', progress: 100, agent: '金克丝', duration: 2 },
    { id: 'st2', name: '编写代码', status: 'completed', progress: 100, agent: '艾克', duration: 3 },
    { id: 'st3', name: '编写测试', status: 'running', progress: 80, agent: '凯特琳' },
  ]);
  hud.updateTokens(12450);
  await delay(500);
  
  hud.recordToolCall('exec', { command: 'bun test' }, 800, { success: true, testsPassed: 54 });
  hud.updateSubtasks([
    { id: 'st1', name: '设计架构', status: 'completed', progress: 100, agent: '金克丝', duration: 2 },
    { id: 'st2', name: '编写代码', status: 'completed', progress: 100, agent: '艾克', duration: 3 },
    { id: 'st3', name: '编写测试', status: 'completed', progress: 100, agent: '凯特琳', duration: 2 },
  ]);
  hud.updateTokens(15670);
  await delay(300);
  
  hud.setPhase('execute', 100);
  await delay(300);
  
  // Phase: Aggregate
  hud.setPhase('aggregate');
  hud.setAction('汇总结果...');
  hud.recordDecision('任务成功完成', '54 个测试全部通过');
  await delay(500);
  
  hud.setPhase('aggregate', 100);
  await delay(300);
  
  // Phase: Complete
  hud.completeTask('Agent Memory System SDK 完成！54 个测试通过，共 2059 行代码');
  await delay(1000);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);