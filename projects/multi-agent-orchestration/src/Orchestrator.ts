/**
 * Orchestrator - Task Decomposition and Dispatch
 */

import type {
  Task,
  TaskRequest,
  SubTask,
  Assignment,
  TaskProgress,
  SubTaskStatus,
  FinalResult,
  Blocker,
} from './index.ts';

import { AgentPool } from './AgentPool.ts';

// ID generator
const generateId = () => `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const generateSubtaskId = () => `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export interface OrchestratorConfig {
  agentPool: AgentPool;
  
  // Decomposition strategy
  decompositionStrategy?: 'auto' | 'manual' | 'ai';
  
  // Maximum subtasks per task
  maxSubtasks?: number;
  
  // Timeout for task completion
  defaultTimeout?: number;
}

export class Orchestrator {
  private agentPool: AgentPool;
  private tasks: Map<string, Task> = new Map();
  private config: OrchestratorConfig;
  
  constructor(config: OrchestratorConfig) {
    this.agentPool = config.agentPool;
    this.config = {
      decompositionStrategy: config.decompositionStrategy || 'auto',
      maxSubtasks: config.maxSubtasks || 10,
      defaultTimeout: config.defaultTimeout || 3600,  // 1 hour
      ...config,
    };
  }
  
  /**
   * Create a new task from request
   */
  createTask(request: TaskRequest): Task {
    const task: Task = {
      id: generateId(),
      request,
      subtasks: [],
      status: 'pending',
      progress: 0,
      assignments: [],
      sharedContext: new Map(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.tasks.set(task.id, task);
    console.log(`[Orchestrator] Created task: ${task.id}`);
    
    return task;
  }
  
  /**
   * Decompose a task into subtasks
   */
  async decomposeTask(taskId: string): SubTask[] {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    if (task.status !== 'pending') {
      throw new Error(`Task already decomposed or running: ${taskId}`);
    }
    
    // Analyze task complexity
    const analysis = await this.analyzeTask(task.request);
    
    // Generate subtasks based on strategy
    let subtasks: SubTask[];
    
    if (this.config.decompositionStrategy === 'ai') {
      subtasks = await this.aiDecompose(task, analysis);
    } else {
      subtasks = this.autoDecompose(task, analysis);
    }
    
    // Update task
    task.subtasks = subtasks;
    task.status = 'decomposed';
    task.updatedAt = new Date();
    
    console.log(`[Orchestrator] Decomposed task into ${subtasks.length} subtasks`);
    
    return subtasks;
  }
  
  /**
   * Assign agents to subtasks
   */
  async assignAgents(taskId: string): Assignment[] {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    const assignments: Assignment[] = [];
    
    // Sort subtasks by dependencies
    const sorted = this.sortByDependencies(task.subtasks);
    
    for (const subtask of sorted) {
      // Check if dependencies are met
      if (!this.dependenciesMet(task, subtask)) {
        subtask.status = 'waiting_input';
        continue;
      }
      
      // Find best agent
      const agent = this.agentPool.findBestAgent({
        taskType: subtask.type as any,
        requiredCapabilities: subtask.description.split(' ').slice(0, 3),
        availability: true,
      });
      
      if (!agent) {
        console.warn(`[Orchestrator] No agent available for subtask: ${subtask.id}`);
        continue;
      }
      
      // Create assignment
      const assignment: Assignment = {
        subtaskId: subtask.id,
        agentId: agent.id,
        assignedAt: new Date(),
        status: 'assigned',
      };
      
      assignments.push(assignment);
      task.assignments.push(assignment);
      
      // Mark agent as busy
      this.agentPool.setAgentBusy(agent.id, subtask.id);
      
      // Update subtask
      subtask.assignedAgent = agent.id;
      subtask.status = 'running';
      
      console.log(`[Orchestrator] Assigned ${agent.name} to subtask: ${subtask.id}`);
    }
    
    // Update task status
    if (assignments.length > 0) {
      task.status = 'running';
    }
    task.updatedAt = new Date();
    
    return assignments;
  }
  
  /**
   * Track task progress
   */
  trackProgress(taskId: string): TaskProgress {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    // Calculate subtask progress
    const subtaskProgress = task.subtasks.map(st => ({
      subtaskId: st.id,
      status: st.status,
      progress: this.calculateSubtaskProgress(st),
      agentId: st.assignedAgent,
      message: st.result?.success ? 'Completed' : undefined,
    }));
    
    // Calculate overall progress
    const overallProgress = this.calculateOverallProgress(task);
    
    // Detect blockers
    const blockers = this.detectBlockers(task);
    
    // Estimate remaining time
    const estimatedTimeRemaining = this.estimateRemainingTime(task);
    
    return {
      taskId,
      overallProgress,
      subtaskProgress,
      blockers,
      estimatedTimeRemaining,
    };
  }
  
  /**
   * Complete a subtask with result
   */
  completeSubtask(taskId: string, subtaskId: string, result: any): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
      throw new Error(`Subtask not found: ${subtaskId}`);
    }
    
    // Update subtask result
    subtask.result = {
      success: true,
      output: result,
      metrics: {
        duration: 0,  // would be tracked
        tokensUsed: 0,
      },
    };
    subtask.status = 'completed';
    
    // Update shared context with output
    for (const key of subtask.outputKeys) {
      task.sharedContext.set(key, result[key]);
    }
    
    // Free the agent
    if (subtask.assignedAgent) {
      this.agentPool.setAgentIdle(subtask.assignedAgent);
    }
    
    // Update task progress
    task.progress = this.calculateOverallProgress(task);
    task.updatedAt = new Date();
    
    // Check if all subtasks complete
    if (task.subtasks.every(st => st.status === 'completed')) {
      task.status = 'completed';
      task.completedAt = new Date();
      console.log(`[Orchestrator] Task completed: ${taskId}`);
    }
    
    // Try to assign waiting subtasks
    this.assignAgents(taskId);
  }
  
  /**
   * Aggregate final results
   */
  aggregateResults(taskId: string): FinalResult {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    // Collect all results
    const results = task.subtasks
      .filter(st => st.status === 'completed' && st.result)
      .map(st => st.result!);
    
    // Merge outputs
    const mergedOutput: any = {};
    for (const result of results) {
      if (result.output) {
        Object.assign(mergedOutput, result.output);
      }
    }
    
    // Generate summary
    const summary = this.generateSummary(task, results);
    
    // Aggregate metrics
    const metrics = {
      totalDuration: results.reduce((sum, r) => sum + r.metrics.duration, 0),
      totalTokensUsed: results.reduce((sum, r) => sum + (r.metrics.tokensUsed || 0), 0),
      totalApiCalls: results.reduce((sum, r) => sum + (r.metrics.apiCalls || 0), 0),
      agentsUsed: task.subtasks
        .filter(st => st.assignedAgent)
        .map(st => st.assignedAgent!),
    };
    
    return {
      taskId,
      success: task.status === 'completed',
      output: mergedOutput,
      summary,
      metrics,
      observations: results.flatMap(r => r.observations || []),
    };
  }
  
  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get specific task
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }
  
  // ========================================
  // Private Methods
  // ========================================
  
  private async analyzeTask(request: TaskRequest): TaskAnalysis {
    // Simple analysis for MVP
    const complexity = this.estimateComplexity(request.description);
    const canParallelize = this.canParallelize(request.type);
    
    return {
      complexity,
      canParallelize,
      estimatedDuration: complexity * 60,  // minutes to seconds
      suggestedSubtasks: this.suggestSubtaskCount(complexity),
    };
  }
  
  private autoDecompose(task: Task, analysis: TaskAnalysis): SubTask[] {
    const subtasks: SubTask[] = [];
    const parts = this.splitDescription(task.request.description);
    
    for (let i = 0; i < parts.length && i < this.config.maxSubtasks!; i++) {
      const subtask: SubTask = {
        id: generateSubtaskId(),
        parentTaskId: task.id,
        type: task.request.type,
        description: parts[i],
        inputRequirements: i > 0 ? [`st_${i - 1}_output`] : [],
        outputKeys: [`st_${i}_output`],
        status: 'pending',
        dependencies: i > 0 ? [subtasks[i - 1].id] : [],
      };
      subtasks.push(subtask);
    }
    
    return subtasks;
  }
  
  private async aiDecompose(task: Task, analysis: TaskAnalysis): SubTask[] {
    // TODO: Use AI model to decompose
    // For MVP, fallback to auto
    return this.autoDecompose(task, analysis);
  }
  
  private splitDescription(description: string): string[] {
    // Split by conjunctions and commas
    const separators = ['然后', '接着', '之后', '同时', '以及', '和', ', ', '；', '; '];
    
    let parts = [description];
    for (const sep of separators) {
      parts = parts.flatMap(p => p.split(sep).filter(s => s.trim()));
    }
    
    // If no splits, create phases
    if (parts.length === 1) {
      parts = [
        `分析: ${description}`,
        `设计: 制定方案`,
        `实现: 执行主要工作`,
        `验证: 检查结果`,
      ];
    }
    
    return parts.map(p => p.trim());
  }
  
  private estimateComplexity(description: string): number {
    // Simple heuristic
    const factors = {
      length: description.length / 100,  // base complexity
      keywords: ['实现', '集成', '重构', '优化', '分析'].filter(k => description.includes(k)).length,
      complexityWords: ['复杂', '多个', '并行', '协作', '分布式'].filter(w => description.includes(w)).length,
    };
    
    return Math.min(1 + factors.length * 0.5 + factors.keywords * 0.5 + factors.complexityWords * 0.3, 5);
  }
  
  private canParallelize(type: string): boolean {
    return type === 'research' || type === 'analysis' || type === 'mixed';
  }
  
  private suggestSubtaskCount(complexity: number): number {
    return Math.min(Math.ceil(complexity * 2), this.config.maxSubtasks!);
  }
  
  private sortByDependencies(subtasks: SubTask[]): SubTask[] {
    // Topological sort by dependencies
    const sorted: SubTask[] = [];
    const visited = new Set<string>();
    
    const visit = (st: SubTask) => {
      if (visited.has(st.id)) return;
      visited.add(st.id);
      
      for (const depId of st.dependencies) {
        const dep = subtasks.find(s => s.id === depId);
        if (dep) visit(dep);
      }
      
      sorted.push(st);
    };
    
    for (const st of subtasks) {
      visit(st);
    }
    
    return sorted;
  }
  
  private dependenciesMet(task: Task, subtask: SubTask): boolean {
    return subtask.dependencies.every(depId => {
      const dep = task.subtasks.find(st => st.id === depId);
      return dep && dep.status === 'completed';
    });
  }
  
  private calculateSubtaskProgress(subtask: SubTask): number {
    switch (subtask.status) {
      case 'completed': return 100;
      case 'running': return 50;
      case 'waiting_input': return 25;
      case 'pending': return 0;
      case 'failed': return 0;
      default: return 0;
    }
  }
  
  private calculateOverallProgress(task: Task): number {
    if (task.subtasks.length === 0) return 0;
    
    const total = task.subtasks.reduce((sum, st) => sum + this.calculateSubtaskProgress(st), 0);
    return Math.round(total / task.subtasks.length);
  }
  
  private detectBlockers(task: Task): Blocker[] {
    const blockers: Blocker[] = [];
    
    for (const st of task.subtasks) {
      if (st.status === 'waiting_input') {
        blockers.push({
          subtaskId: st.id,
          reason: '等待依赖完成',
          waitingFor: st.dependencies,
          suggestedAction: '检查依赖子任务状态',
        });
      }
      
      if (st.status === 'pending' && !st.assignedAgent) {
        blockers.push({
          subtaskId: st.id,
          reason: '没有可用的 Agent',
          suggestedAction: '等待 Agent 空闲或添加更多 Agent',
        });
      }
    }
    
    return blockers;
  }
  
  private estimateRemainingTime(task: Task): number {
    const completedCount = task.subtasks.filter(st => st.status === 'completed').length;
    const remainingCount = task.subtasks.length - completedCount;
    
    // Rough estimate: 60 seconds per remaining subtask
    return remainingCount * 60;
  }
  
  private generateSummary(task: Task, results: SubTaskResult[]): string {
    const taskDesc = task.request.description;
    const subtaskCount = task.subtasks.length;
    const successCount = results.filter(r => r.success).length;
    
    return `任务"${taskDesc}"已完成。共 ${subtaskCount} 个子任务，成功 ${successCount} 个。`;
  }
}

// Internal type
interface TaskAnalysis {
  complexity: number;
  canParallelize: boolean;
  estimatedDuration: number;
  suggestedSubtasks: number;
}