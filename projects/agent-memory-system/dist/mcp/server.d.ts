/**
 * Agent Memory System - MCP Server
 *
 * MCP Server wrapper that allows Claude Code to interact with the memory system
 * Implements the Model Context Protocol for tool calling
 */
import type { MemoryConfig } from '../index';
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
export declare class MCPServer {
    private memory;
    private tools;
    private agentId;
    private projectId;
    constructor(config: Omit<MemoryConfig, 'storage'> & {
        storagePath?: string;
    });
    /**
     * Initialize the memory client and server
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the server
     */
    shutdown(): Promise<void>;
    /**
     * Register all available MCP tools
     */
    private registerTools;
    /**
     * Handle an incoming MCP request
     */
    handleRequest(request: MCPRequest): Promise<MCPResponse>;
    /**
     * Handle a tool call
     */
    private handleToolCall;
    /**
     * Start the MCP server in stdio mode
     */
    startStdio(): Promise<void>;
}
export {};
//# sourceMappingURL=server.d.ts.map