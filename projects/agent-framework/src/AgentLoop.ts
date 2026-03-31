/**
 * Agent Loop - Core Execution Loop
 */

import { QueryEngine } from './QueryEngine.ts';
import { ToolRegistry } from './ToolRegistry.ts';
import { PermissionSystem } from './PermissionSystem.ts';
import type { 
  AgentState, 
  AgentEvent, 
  AgentConfig,
  ToolContext,
} from './index.ts';

export interface AgentLoopOptions {
  config: AgentConfig;
  workingDirectory: string;
  permissionCallback?: (permission: any) => Promise<boolean>;
}

export class AgentLoop {
  private config: AgentConfig;
  private state: AgentState = 'stopped';
  private queryEngine: QueryEngine;
  private toolRegistry: ToolRegistry;
  private permissionSystem: PermissionSystem;
  private workingDirectory: string;
  private sessionId: string;
  
  constructor(options: AgentLoopOptions) {
    this.config = options.config;
    this.workingDirectory = options.workingDirectory;
    this.sessionId = `session_${Date.now()}`;
    
    // Initialize components
    this.queryEngine = new QueryEngine();
    this.permissionSystem = new PermissionSystem();
    this.toolRegistry = new ToolRegistry(this.permissionSystem);
    
    // Set permission callback
    if (options.permissionCallback) {
      this.permissionSystem.onConfirm(options.permissionCallback);
    }
  }
  
  /**
   * Run the agent loop
   */
  async *run(input: string): AsyncGenerator<AgentEvent> {
    this.state = 'running';
    
    try {
      // 1. Analyze input
      yield { type: 'thinking', content: '分析任务...' };
      const analysis = this.queryEngine.analyze(input);
      
      yield { 
        type: 'message', 
        content: `意图: ${analysis.intent}, 工具: ${analysis.tools.join(', ') || '无'}` 
      };
      
      // 2. Generate route
      const route = this.queryEngine.route(analysis);
      
      // 3. Generate plan
      const plan = this.queryEngine.plan(route);
      
      yield { 
        type: 'message', 
        content: `计划: ${plan.steps.length} 步骤, 预计 ${plan.estimatedTokens} tokens` 
      };
      
      // 4. Execute steps
      for (const step of plan.steps) {
        if (this.state === 'stopped') {
          yield { type: 'message', content: '任务已停止' };
          break;
        }
        
        while (this.state === 'paused') {
          await new Promise(r => setTimeout(r, 100));
        }
        
        if (step.type === 'tool_call' && step.tool) {
          // Execute tool
          yield { type: 'tool_call', tool: step.tool, input: step.input || {} };
          
          const context: ToolContext = {
            agentId: this.config.id,
            sessionId: this.sessionId,
            workingDirectory: this.workingDirectory,
          };
          
          const result = await this.toolRegistry.execute(step.tool, step.input || {}, context);
          
          yield { type: 'tool_result', tool: step.tool, result };
          
          if (!result.success) {
            yield { type: 'error', error: new Error(result.error || 'Tool failed') };
          }
        }
        
        if (step.type === 'reasoning' && step.reasoning) {
          yield { type: 'thinking', content: step.reasoning };
        }
      }
      
      // 5. Complete
      this.state = 'stopped';
      yield { type: 'complete', result: { success: true, stepsExecuted: plan.steps.length } };
      
    } catch (error) {
      this.state = 'stopped';
      yield { 
        type: 'error', 
        error: error instanceof Error ? error : new Error('Unknown error') 
      };
    }
  }
  
  /**
   * Stop the loop
   */
  stop(): void {
    this.state = 'stopped';
  }
  
  /**
   * Pause the loop
   */
  pause(): void {
    if (this.state === 'running') {
      this.state = 'paused';
    }
  }
  
  /**
   * Resume the loop
   */
  resume(): void {
    if (this.state === 'paused') {
      this.state = 'running';
    }
  }
  
  /**
   * Get current state
   */
  getState(): AgentState {
    return this.state;
  }
  
  /**
   * Register custom tool
   */
  registerTool(tool: any): void {
    this.toolRegistry.register(tool);
  }
  
  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}