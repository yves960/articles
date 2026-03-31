/**
 * Multi-Agent Orchestration - Example Usage
 */

import { Orchestrator } from './Orchestrator.ts';
import { AgentPool } from './AgentPool.ts';
import { SharedContext, MessageBus } from './SharedContext.ts';

async function main() {
  console.log('=== Multi-Agent Orchestration Demo ===\n');
  
  // Initialize agent pool
  const agentPool = new AgentPool();
  
  // Show available agents
  console.log('📋 Available Agents:');
  for (const agent of agentPool.getAgents()) {
    console.log(`  - ${agent.name} (${agent.role}): ${agent.capabilities.taskTypes.join(', ')}`);
  }
  
  // Initialize orchestrator
  const orchestrator = new Orchestrator({
    agentPool,
    decompositionStrategy: 'auto',
    maxSubtasks: 5,
  });
  
  // Create a task
  console.log('\n📝 Creating task...');
  const task = orchestrator.createTask({
    type: 'mixed',
    description: '实现语音日记功能：调研技术方案、设计数据结构、编写代码实现',
    priority: 'high',
  });
  
  console.log(`Task ID: ${task.id}`);
  
  // Decompose task
  console.log('\n🔨 Decomposing task...');
  const subtasks = await orchestrator.decomposeTask(task.id);
  
  console.log('Subtasks:');
  for (const st of subtasks) {
    console.log(`  ${st.id}: ${st.description}`);
    if (st.dependencies.length > 0) {
      console.log(`    Dependencies: ${st.dependencies.join(', ')}`);
    }
  }
  
  // Assign agents
  console.log('\n👥 Assigning agents...');
  const assignments = await orchestrator.assignAgents(task.id);
  
  console.log('Assignments:');
  for (const a of assignments) {
    const agent = agentPool.getAgents().find(ag => ag.id === a.agentId);
    const subtask = subtasks.find(st => st.id === a.subtaskId);
    console.log(`  ${agent?.name} → ${subtask?.description.slice(0, 30)}...`);
  }
  
  // Track progress
  console.log('\n📊 Progress:');
  const progress = orchestrator.trackProgress(task.id);
  console.log(`Overall: ${progress.overallProgress}%`);
  console.log(`Estimated time remaining: ${progress.estimatedTimeRemaining}s`);
  
  // Simulate completing subtasks
  console.log('\n✅ Simulating subtask completion...');
  
  // Complete first subtask
  const firstSubtask = subtasks.find(st => !st.dependencies.length);
  if (firstSubtask) {
    orchestrator.completeSubtask(task.id, firstSubtask.id, {
      designDoc: 'projects/voice-diary/DESIGN.md',
      approach: 'VibeVoice-ASR',
    });
    console.log(`Completed: ${firstSubtask.description.slice(0, 30)}...`);
  }
  
  // Check new progress
  const progress2 = orchestrator.trackProgress(task.id);
  console.log(`\nProgress after 1 subtask: ${progress2.overallProgress}%`);
  
  // Show blockers
  if (progress2.blockers.length > 0) {
    console.log('Blockers:');
    for (const b of progress2.blockers) {
      console.log(`  - ${b.reason} (${b.subtaskId})`);
    }
  }
  
  // Try to assign more agents
  const assignments2 = await orchestrator.assignAgents(task.id);
  console.log(`\nNew assignments: ${assignments2.length}`);
  
  // Complete remaining subtasks
  for (const st of subtasks) {
    if (st.status !== 'completed') {
      // Simulate completion
      orchestrator.completeSubtask(task.id, st.id, {
        output: `Result of ${st.description}`,
      });
      console.log(`Completed: ${st.description.slice(0, 30)}...`);
    }
  }
  
  // Final results
  console.log('\n📖 Final Results:');
  const results = orchestrator.aggregateResults(task.id);
  console.log(`Success: ${results.success}`);
  console.log(`Summary: ${results.summary}`);
  console.log(`Agents used: ${results.metrics.agentsUsed.join(', ')}`);
  console.log(`Total time: ${results.metrics.totalDuration}s`);
  
  // Shared Context Demo
  console.log('\n🔄 Shared Context Demo:');
  const sharedContext = new SharedContext(task.id);
  
  // Subscribe to changes
  sharedContext.subscribe('agent_dev_ekko', ['designDoc', 'codeFiles'], (change) => {
    console.log(`  [Ekko] Context changed: ${change.key} v${change.version}`);
  });
  
  // Set values
  sharedContext.set('designDoc', 'projects/voice-diary/DESIGN.md', 'agent_pm_jinx');
  sharedContext.set('codeFiles', ['ASRClient.ts', 'EmotionAnalyzer.ts'], 'agent_dev_ekko');
  
  console.log('Context data:', sharedContext.toObject());
  
  // Message Bus Demo
  console.log('\n📨 Message Bus Demo:');
  const messageBus = new MessageBus(task.id);
  
  // Listen for messages
  messageBus.listen('agent_dev_ekko', (msg) => {
    console.log(`  [Ekko] Received: ${msg.type} from ${msg.from}`);
  });
  
  // Send messages
  messageBus.send({
    from: 'agent_pm_jinx',
    to: 'agent_dev_ekko',
    type: 'request',
    content: { request: 'get-design-doc' },
  });
  
  messageBus.send({
    from: 'agent_director_vi',
    to: 'broadcast',
    type: 'update',
    content: { update: 'Task progress: 50%' },
  });
  
  console.log('\n✅ Demo complete!');
}

main().catch(console.error);