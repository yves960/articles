/**
 * Query Engine - Analyze and route user queries
 */

import type { 
  QueryAnalysis, 
  QueryIntent, 
  Entity,
  Route, 
  ExecutionPlan, 
  ExecutionStep 
} from './index.ts';

export class QueryEngine {
  private toolKeywords: Map<string, string[]>;
  
  constructor() {
    this.toolKeywords = new Map([
      ['read_file', ['读取', 'read', '查看', '打开', '文件']],
      ['write_file', ['写入', 'write', '创建', '保存', '文件']],
      ['edit_file', ['编辑', 'edit', '修改', '改', '文件']],
      ['execute_command', ['执行', 'run', '运行', '命令', 'command']],
      ['web_search', ['搜索', 'search', '查找', 'find', 'web']],
      ['web_fetch', ['获取', 'fetch', '下载', 'url', 'http']],
    ]);
  }
  
  /**
   * Analyze user input
   */
  analyze(input: string): QueryAnalysis {
    const intent = this.detectIntent(input);
    const entities = this.extractEntities(input);
    const tools = this.detectTools(input);
    const complexity = this.estimateComplexity(input, tools);
    
    return {
      intent,
      entities,
      tools,
      complexity,
      requiresMemory: this.needsMemory(input),
    };
  }
  
  /**
   * Route to processing strategy
   */
  route(analysis: QueryAnalysis): Route {
    if (analysis.tools.length === 0) {
      return {
        type: 'conversation',
        tools: [],
        context: [],
      };
    }
    
    if (analysis.tools.length === 1 && analysis.complexity <= 2) {
      return {
        type: 'single_tool',
        tools: [{ name: analysis.tools[0], input: {} }],
        context: [],
      };
    }
    
    return {
      type: 'multi_tool',
      tools: analysis.tools.map(t => ({ name: t, input: {} })),
      context: [],
    };
  }
  
  /**
   * Generate execution plan
   */
  plan(route: Route): ExecutionPlan {
    const steps: ExecutionStep[] = [];
    
    switch (route.type) {
      case 'single_tool':
        steps.push({
          type: 'tool_call',
          tool: route.tools[0].name,
          input: route.tools[0].input,
        });
        break;
        
      case 'multi_tool':
        for (const spec of route.tools) {
          steps.push({
            type: 'tool_call',
            tool: spec.name,
            input: spec.input,
          });
        }
        break;
        
      case 'conversation':
        steps.push({
          type: 'reasoning',
          reasoning: 'Generate conversational response',
        });
        break;
    }
    
    steps.push({
      type: 'output',
      output: 'Response',
    });
    
    return {
      steps,
      estimatedTokens: steps.length * 500,
      timeout: steps.length * 30000,  // 30s per step
    };
  }
  
  // === Private Methods ===
  
  private detectIntent(input: string): QueryIntent {
    const questionPatterns = ['?', '吗', '什么', '怎么', '如何', '为什么'];
    const commandPatterns = ['帮我', '请', '执行', '运行', '读取', '写入', '创建'];
    
    for (const p of questionPatterns) {
      if (input.includes(p)) return 'question';
    }
    
    for (const p of commandPatterns) {
      if (input.includes(p)) return 'command';
    }
    
    return 'conversation';
  }
  
  private extractEntities(input: string): Entity[] {
    const entities: Entity[] = [];
    
    // File paths
    const filePathPattern = /['"]([^'"]+\.(ts|js|md|json|txt))['"]/g;
    let match;
    while ((match = filePathPattern.exec(input)) !== null) {
      entities.push({
        type: 'file_path',
        value: match[1],
        confidence: 0.9,
      });
    }
    
    // URLs
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    while ((match = urlPattern.exec(input)) !== null) {
      entities.push({
        type: 'url',
        value: match[1],
        confidence: 0.95,
      });
    }
    
    return entities;
  }
  
  private detectTools(input: string): string[] {
    const tools: string[] = [];
    
    for (const [tool, keywords] of this.toolKeywords.entries()) {
      for (const keyword of keywords) {
        if (input.toLowerCase().includes(keyword.toLowerCase())) {
          if (!tools.includes(tool)) {
            tools.push(tool);
          }
          break;
        }
      }
    }
    
    // Limit to max 2 tools for simple queries
    return tools.slice(0, 2);
  }
  
  private estimateComplexity(input: string, tools: string[]): number {
    let complexity = 1;
    
    // More tools = more complexity
    complexity += Math.min(tools.length - 1, 2);
    
    // Longer input
    if (input.length > 200) complexity += 1;
    if (input.length > 500) complexity += 1;
    
    // Complex keywords
    const complexKeywords = ['分析', '重构', '实现', '设计', 'analyze', 'refactor', 'implement'];
    for (const kw of complexKeywords) {
      if (input.includes(kw)) {
        complexity += 1;
        break;
      }
    }
    
    return Math.min(complexity, 5);
  }
  
  private needsMemory(input: string): boolean {
    const memoryKeywords = ['记住', '之前的', '上次', '历史', 'remember', 'previous', 'history'];
    return memoryKeywords.some(kw => input.includes(kw));
  }
}