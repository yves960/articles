/**
 * Tool System - Tool Registry and Execution
 */

import type { Tool, ToolContext, ToolResult } from './index.ts';
import { PermissionSystem, PERMISSIONS } from './PermissionSystem.ts';

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private permissionSystem: PermissionSystem;
  
  constructor(permissionSystem: PermissionSystem) {
    this.permissionSystem = permissionSystem;
    
    // Register default tools
    this.registerDefaults();
  }
  
  /**
   * Register a tool
   */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }
  
  /**
   * Get a tool by name
   */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }
  
  /**
   * List all tools
   */
  list(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  /**
   * Execute a tool with permission check
   */
  async execute(
    name: string, 
    input: any, 
    context: ToolContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        output: null,
        error: `Tool not found: ${name}`,
      };
    }
    
    // Check permissions
    for (const permission of tool.permissions) {
      const resource = this.extractResource(name, input);
      const fullPermission = { ...permission, resource };
      
      const allowed = await this.permissionSystem.request(fullPermission);
      if (!allowed) {
        return {
          success: false,
          output: null,
          error: `Permission denied: ${permission.type}`,
        };
      }
    }
    
    // Execute with timeout
    const timeout = tool.timeout || 30000;
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        tool.execute(input, context),
        new Promise<ToolResult>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        ),
      ]);
      
      result.metadata = {
        ...result.metadata,
        duration: Date.now() - startTime,
      };
      
      return result;
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          duration: Date.now() - startTime,
        },
      };
    }
  }
  
  /**
   * Register default tools
   */
  private registerDefaults(): void {
    // Read file tool
    this.register({
      name: 'read_file',
      description: 'Read file contents',
      inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
      permissions: [PERMISSIONS.readFile('*')],
      execute: async (input) => {
        try {
          const content = await Bun.file(input.path).text();
          return { success: true, output: { content, path: input.path } };
        } catch (error) {
          return { 
            success: false, 
            output: null, 
            error: `Failed to read file: ${input.path}` 
          };
        }
      },
    });
    
    // Write file tool
    this.register({
      name: 'write_file',
      description: 'Write content to file',
      inputSchema: { 
        type: 'object', 
        properties: { 
          path: { type: 'string' }, 
          content: { type: 'string' } 
        } 
      },
      permissions: [PERMISSIONS.writeFile('*')],
      execute: async (input) => {
        try {
          await Bun.write(input.path, input.content);
          return { success: true, output: { path: input.path, bytes: input.content.length } };
        } catch (error) {
          return { 
            success: false, 
            output: null, 
            error: `Failed to write file: ${input.path}` 
          };
        }
      },
    });
    
    // Execute command tool
    this.register({
      name: 'execute_command',
      description: 'Run shell command',
      inputSchema: { 
        type: 'object', 
        properties: { 
          command: { type: 'string' }, 
          cwd: { type: 'string' } 
        } 
      },
      permissions: [PERMISSIONS.executeCommand('*')],
      timeout: 60000,
      execute: async (input, context) => {
        try {
          const result = Bun.spawnSync({
            cmd: ['sh', '-c', input.command],
            cwd: input.cwd || context.workingDirectory,
          });
          
          return {
            success: result.exitCode === 0,
            output: {
              stdout: result.stdout.toString(),
              stderr: result.stderr.toString(),
              exitCode: result.exitCode,
            },
          };
        } catch (error) {
          return { 
            success: false, 
            output: null, 
            error: `Failed to execute: ${input.command}` 
          };
        }
      },
    });
  }
  
  /**
   * Extract resource from tool input
   */
  private extractResource(toolName: string, input: any): string {
    switch (toolName) {
      case 'read_file':
      case 'write_file':
      case 'delete_file':
        return input.path || '*';
      case 'execute_command':
        return input.command || '*';
      case 'network_request':
        return input.url || '*';
      default:
        return '*';
    }
  }
}