/**
 * Agent Memory System - MCP Server
 * 
 * MCP Server wrapper that allows Claude Code to interact with the memory system
 * Implements the Model Context Protocol for tool calling
 */

import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MemoryClient } from '../MemoryClient';
import type { 
  MemoryConfig, 
  Session, 
  Observation,
  SearchOptions,
  GetContextInput 
} from '../index';

// ============================================
// MCP Protocol Types
// ============================================

interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// ============================================
// MCP Server Implementation
// ============================================

export class MCPServer {
  private memory: MemoryClient;
  private tools: Map<string, MCPTool>;
  private agentId: string;
  private projectId: string;
  
  constructor(config: Omit<MemoryConfig, 'storage'> & { storagePath?: string }) {
    this.agentId = config.agentId;
    this.projectId = config.projectId;
    
    const memoryConfig: MemoryConfig = {
      agentId: config.agentId,
      projectId: config.projectId,
      storage: {
        type: 'sqlite',
        path: config.storagePath || './memory.db',
      },
      vector: config.vector,
    };
    
    this.memory = new MemoryClient(memoryConfig);
    this.tools = new Map();
    this.registerTools();
  }
  
  /**
   * Initialize the memory client and server
   */
  async initialize(): Promise<void> {
    await this.memory.initialize();
    console.error('[MCP Server] Memory system initialized');
  }
  
  /**
   * Shutdown the server
   */
  async shutdown(): Promise<void> {
    await this.memory.shutdown();
  }
  
  /**
   * Register all available MCP tools
   */
  private registerTools(): void {
    // Session Management Tools
    this.tools.set('memory_start_session', {
      name: 'memory_start_session',
      description: 'Start a new memory session for tracking agent activities',
      inputSchema: {
        type: 'object',
        properties: {
          userPrompt: { 
            type: 'string', 
            description: 'The user prompt or task description' 
          },
          metadata: { 
            type: 'object', 
            description: 'Additional metadata for the session' 
          },
        },
      },
    });
    
    this.tools.set('memory_end_session', {
      name: 'memory_end_session',
      description: 'End a memory session and optionally create a summary',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { 
            type: 'string', 
            description: 'The session ID to end' 
          },
          status: { 
            type: 'string', 
            enum: ['completed', 'failed'],
            description: 'Session completion status' 
          },
          summary: {
            type: 'object',
            description: 'Session summary with learned insights',
            properties: {
              request: { type: 'string' },
              investigated: { type: 'string' },
              learned: { type: 'string' },
              completed: { type: 'string' },
              nextSteps: { type: 'string' },
            },
          },
        },
        required: ['sessionId', 'status'],
      },
    });
    
    // Observation Tools
    this.tools.set('memory_record_observation', {
      name: 'memory_record_observation',
      description: 'Record an observation (decision, discovery, change, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { 
            type: 'string', 
            description: 'The session ID' 
          },
          type: { 
            type: 'string', 
            enum: ['decision', 'bugfix', 'feature', 'discovery', 'change'],
            description: 'Type of observation' 
          },
          title: { 
            type: 'string', 
            description: 'Short title for the observation' 
          },
          text: { 
            type: 'string', 
            description: 'Detailed description' 
          },
          facts: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Key facts from this observation' 
          },
          concepts: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Concepts involved' 
          },
          filesRead: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Files that were read' 
          },
          filesModified: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Files that were modified' 
          },
          tokensUsed: { 
            type: 'number', 
            description: 'Token usage for this observation' 
          },
        },
        required: ['sessionId', 'type', 'text'],
      },
    });
    
    this.tools.set('memory_record_tool_use', {
      name: 'memory_record_tool_use',
      description: 'Automatically record a tool execution as an observation',
      inputSchema: {
        type: 'object',
        properties: {
          sessionId: { 
            type: 'string', 
            description: 'The session ID (optional, uses current session if not provided)' 
          },
          toolName: { 
            type: 'string', 
            description: 'Name of the tool (BashTool, FileWriteTool, etc.)' 
          },
          input: { 
            type: 'object', 
            description: 'Tool input/arguments' 
          },
          result: { 
            type: 'object', 
            description: 'Tool execution result' 
          },
        },
        required: ['toolName', 'input', 'result'],
      },
    });
    
    // Search Tools
    this.tools.set('memory_search', {
      name: 'memory_search',
      description: 'Search observations and memories',
      inputSchema: {
        type: 'object',
        properties: {
          query: { 
            type: 'string', 
            description: 'Search query' 
          },
          type: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Filter by observation types' 
          },
          limit: { 
            type: 'number', 
            default: 10,
            description: 'Maximum results to return' 
          },
        },
      },
    });
    
    this.tools.set('memory_get_context', {
      name: 'memory_get_context',
      description: 'Get relevant context for a new task (memories + recent observations)',
      inputSchema: {
        type: 'object',
        properties: {
          query: { 
            type: 'string', 
            description: 'The task or question context' 
          },
          maxTokens: { 
            type: 'number', 
            default: 2000,
            description: 'Maximum tokens to return' 
          },
          includeRecent: { 
            type: 'boolean', 
            default: true,
            description: 'Include recent observations' 
          },
          includeImportant: { 
            type: 'boolean', 
            default: true,
            description: 'Include important memories' 
          },
        },
        required: ['query'],
      },
    });
    
    // Stats Tools
    this.tools.set('memory_get_stats', {
      name: 'memory_get_stats',
      description: 'Get memory system statistics',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    });
    
    this.tools.set('memory_get_session', {
      name: 'memory_get_session',
      description: 'Get the current active session',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    });
  }
  
  /**
   * Handle an incoming MCP request
   */
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, id, params } = request;
    
    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {
                  listChanged: true,
                },
              },
              serverInfo: {
                name: 'agent-memory-system',
                version: '0.1.0',
              },
            },
          };
          
        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: Array.from(this.tools.values()),
            },
          };
          
        case 'tools/call':
          return await this.handleToolCall(params?.name || '', params?.arguments || {}, id);
          
        default:
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal error',
        },
      };
    }
  }
  
  /**
   * Handle a tool call
   */
  private async handleToolCall(toolName: string, args: Record<string, unknown>, id: string | number): Promise<MCPResponse> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32602,
          message: `Unknown tool: ${toolName}`,
        },
      };
    }
    
    try {
      let result: unknown;
      
      switch (toolName) {
        // Session Management
        case 'memory_start_session': {
          const session = await this.memory.startSession({
            userPrompt: args.userPrompt as string,
            metadata: args.metadata as Record<string, unknown>,
          });
          result = { session };
          break;
        }
        
        case 'memory_end_session': {
          await this.memory.endSession(args.sessionId as string, {
            status: args.status as 'completed' | 'failed',
            summary: args.summary as any,
          });
          result = { success: true };
          break;
        }
        
        // Observations
        case 'memory_record_observation': {
          const observation = await this.memory.recordObservation({
            sessionId: args.sessionId as string,
            type: args.type as any,
            title: args.title as string,
            text: args.text as string,
            facts: args.facts as string[],
            concepts: args.concepts as string[],
            filesRead: args.filesRead as string[],
            filesModified: args.filesModified as string[],
            tokensUsed: args.tokensUsed as number,
          });
          result = { observation };
          break;
        }
        
        case 'memory_record_tool_use': {
          const observation = await this.memory.recordToolUse(
            args.toolName as string,
            args.input,
            args.result,
            args.sessionId as string | undefined
          );
          result = { observation };
          break;
        }
        
        // Search
        case 'memory_search': {
          const searchResults = await this.memory.search({
            agentId: this.agentId,
            type: (args.type as any[]) || undefined,
            limit: args.limit as number || 10,
          });
          result = { 
            observations: searchResults.observations,
            memories: searchResults.memories,
          };
          break;
        }
        
        case 'memory_get_context': {
          const context = await this.memory.getContext({
            query: args.query as string,
            maxTokens: args.maxTokens as number || 2000,
            includeRecent: args.includeRecent as boolean !== false,
            includeImportant: args.includeImportant as boolean !== false,
          });
          result = {
            memories: context.memories,
            recentObservations: context.recentObservations,
            totalTokens: context.totalTokens,
          };
          break;
        }
        
        // Stats
        case 'memory_get_stats': {
          const stats = await this.memory.getStats();
          result = stats;
          break;
        }
        
        case 'memory_get_session': {
          const session = this.memory.getCurrentSession();
          result = { session };
          break;
        }
        
        default:
          throw new Error(`Tool not implemented: ${toolName}`);
      }
      
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Tool execution failed',
        },
      };
    }
  }
  
  /**
   * Start the MCP server in stdio mode
   */
  async startStdio(): Promise<void> {
    await this.initialize();
    
    let buffer = '';
    
    // Read from stdin
    for await (const chunk of process.stdin) {
      buffer += chunk.toString();
      
      // Try to parse complete JSON messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const request = JSON.parse(line) as MCPRequest;
            const response = await this.handleRequest(request);
            console.log(JSON.stringify(response));
          } catch (error) {
            console.error(JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32700,
                message: error instanceof Error ? error.message : 'Parse error',
              },
            }));
          }
        }
      }
    }
    
    await this.shutdown();
  }
}

// ============================================
// CLI Entry Point
// ============================================

async function main() {
  const agentId = process.env.AGENT_ID || 'claude-code';
  const projectId = process.env.PROJECT_ID || 'default';
  const storagePath = process.env.STORAGE_PATH || './memory.db';
  
  const server = new MCPServer({
    agentId,
    projectId,
    storagePath,
    vector: {
      type: 'none',
    },
  });
  
  await server.startStdio();
}

// Run if executed directly
main().catch(console.error);

// Export for programmatic use (class already exported above)
