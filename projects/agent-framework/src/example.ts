/**
 * Agent Framework - Example Usage
 */

import { AgentLoop } from './AgentLoop.ts';
import type { AgentConfig } from './index.ts';

// Agent configuration
const DEV_AGENT_CONFIG: AgentConfig = {
  id: 'dev-agent',
  name: '开发助手',
  description: '专注于代码开发和调试',
  capabilities: {
    tools: ['read_file', 'write_file', 'execute_command'],
    permissions: [
      { type: 'file_read' },
      { type: 'file_write' },
      { type: 'command_execute' },
    ],
  },
  model: {
    provider: 'mock',
    name: 'mock-model',
    temperature: 0.7,
  },
  behavior: {
    maxIterations: 50,
    timeout: 300000,
    autoApprove: false,
  },
  memory: {
    enabled: false,
    maxContextTokens: 8000,
  },
};

async function main() {
  console.log('=== Agent Framework Demo ===\n');
  
  // Create agent loop
  const agent = new AgentLoop({
    config: DEV_AGENT_CONFIG,
    workingDirectory: process.cwd(),
    permissionCallback: async (permission) => {
      console.log(`\n⚠️  需要权限确认: ${permission.type}${permission.resource ? ` (${permission.resource})` : ''}`);
      console.log('   [自动批准演示] 返回 true\n');
      return true;  // Demo: auto-approve
    },
  });
  
  console.log(`🤖 Agent: ${DEV_AGENT_CONFIG.name}`);
  console.log(`📋 Tools: ${DEV_AGENT_CONFIG.capabilities.tools.join(', ')}`);
  console.log(`📁 Working Directory: ${process.cwd()}\n`);
  
  // Test 1: Simple command with explicit path
  console.log('─'.repeat(50));
  console.log('📝 测试 1: 执行命令');
  console.log('─'.repeat(50));
  
  for await (const event of agent.run('执行命令 ls -la')) {
    printEvent(event);
  }
  
  // Test 2: Multi-tool command
  console.log('\n' + '─'.repeat(50));
  console.log('📝 测试 2: 写入文件');
  console.log('─'.repeat(50));
  
  for await (const event of agent.run('创建文件 test.txt 内容为 "Hello Agent Framework"')) {
    printEvent(event);
  }
  
  // Test 3: Execute command
  console.log('\n' + '─'.repeat(50));
  console.log('📝 测试 3: 执行命令');
  console.log('─'.repeat(50));
  
  for await (const event of agent.run('执行命令 echo "Hello from shell"')) {
    printEvent(event);
  }
  
  // Test 4: Conversation
  console.log('\n' + '─'.repeat(50));
  console.log('📝 测试 4: 普通对话');
  console.log('─'.repeat(50));
  
  for await (const event of agent.run('你好，介绍一下你自己')) {
    printEvent(event);
  }
  
  console.log('\n✅ Demo complete!');
}

function printEvent(event: any) {
  const icon = {
    thinking: '🧠',
    tool_call: '🔧',
    tool_result: '📋',
    message: '💬',
    error: '❌',
    complete: '✅',
    permission_request: '⚠️',
  }[event.type] || '📌';
  
  switch (event.type) {
    case 'thinking':
      console.log(`${icon} ${event.content}`);
      break;
      
    case 'tool_call':
      console.log(`${icon} 调用: ${event.tool}`);
      if (Object.keys(event.input || {}).length > 0) {
        console.log(`   输入: ${JSON.stringify(event.input)}`);
      }
      break;
      
    case 'tool_result':
      console.log(`${icon} 结果: ${event.result.success ? '成功' : '失败'}`);
      if (event.result.output) {
        const output = typeof event.result.output === 'string' 
          ? event.result.output 
          : JSON.stringify(event.result.output);
        console.log(`   输出: ${output.slice(0, 100)}${output.length > 100 ? '...' : ''}`);
      }
      if (event.result.error) {
        console.log(`   错误: ${event.result.error}`);
      }
      break;
      
    case 'message':
      console.log(`${icon} ${event.content}`);
      break;
      
    case 'error':
      console.log(`${icon} 错误: ${event.error.message}`);
      break;
      
    case 'complete':
      console.log(`${icon} 完成: ${JSON.stringify(event.result)}`);
      break;
  }
}

main().catch(console.error);