#!/usr/bin/env bun
/**
 * Agent Memory System - CLI Tool
 * 
 * Command-line interface for querying and exporting agent memories
 * 
 * Usage:
 *   bun run src/cli/index.ts <command> [options]
 *   
 * Commands:
 *   sessions      List all sessions
 *   observations  List observations (with optional filters)
 *   memories      List long-term memories
 *   search        Search across all memory types
 *   context       Get context for a specific query
 *   export        Export memories to JSON/Markdown
 *   stats         Show memory statistics
 *   session       Show detailed session info
 */

import { parseArgs } from 'util';
import { MemoryClient } from '../MemoryClient';
import type { MemoryConfig, ObservationType } from '../index';

// ============================================
// CLI Configuration
// ============================================

interface CLIConfig {
  agentId: string;
  projectId: string;
  storagePath: string;
  outputFormat: 'json' | 'table' | 'markdown';
}

const DEFAULT_CONFIG: CLIConfig = {
  agentId: process.env.AGENT_ID || 'cli-user',
  projectId: process.env.PROJECT_ID || 'cli-project',
  storagePath: process.env.STORAGE_PATH || './memory.db',
  outputFormat: 'table',
};

// ============================================
// Output Formatters
// ============================================

function formatAsTable(data: any[]): string {
  if (data.length === 0) return 'No data';
  
  const headers = Object.keys(data[0]);
  const colWidths = headers.map(h => 
    Math.max(h.length, ...data.map(row => String(row[h] || '').length))
  );
  
  const divider = colWidths.map(w => '-'.repeat(w + 2)).join('+');
  
  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join('  ');
  const rows = data.map(row => 
    headers.map((h, i) => String(row[h] || '').padEnd(colWidths[i])).join('  ')
  );
  
  return [headerRow, divider, ...rows].join('\n');
}

function formatAsJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

function formatAsMarkdown(data: any[], title: string): string {
  if (data.length === 0) return `## ${title}\n\nNo data`;
  
  const headers = Object.keys(data[0]);
  
  let md = `## ${title}\n\n`;
  
  // Table header
  md += '| ' + headers.join(' | ') + ' |\n';
  md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  
  // Table rows
  for (const row of data) {
    md += '| ' + headers.map(h => String(row[h] || '')).join(' | ') + ' |\n';
  }
  
  return md;
}

function formatOutput(data: any[], config: CLIConfig): string {
  switch (config.outputFormat) {
    case 'json':
      return formatAsJSON(data);
    case 'markdown':
      return formatAsMarkdown(data, 'Results');
    default:
      return formatAsTable(data);
  }
}

// ============================================
// Commands
// ============================================

async function listSessions(client: MemoryClient, config: CLIConfig): Promise<void> {
  const results = await client.search({
    agentId: config.agentId,
    limit: 100,
  });
  
  const sessions = results.observations.map(o => o.sessionId);
  const uniqueSessions = [...new Set(sessions)];
  
  const sessionData = uniqueSessions.map((sid, i) => ({
    index: i + 1,
    sessionId: sid.slice(0, 8) + '...',
    observations: results.observations.filter(o => o.sessionId === sid).length,
  }));
  
  console.log(formatOutput(sessionData, config));
}

async function listObservations(
  client: MemoryClient, 
  config: CLIConfig,
  options: {
    sessionId?: string;
    type?: string;
    limit?: number;
  }
): Promise<void> {
  const searchOptions: any = {
    agentId: config.agentId,
    limit: options.limit || 50,
  };
  
  if (options.type) {
    searchOptions.type = options.type.split(',') as ObservationType[];
  }
  
  const results = await client.search(searchOptions);
  
  let observations = results.observations;
  
  if (options.sessionId) {
    observations = observations.filter(o => o.sessionId === options.sessionId);
  }
  
  const data = observations.map(o => ({
    id: o.id.slice(0, 8) + '...',
    type: o.type,
    title: (o.title || o.text.slice(0, 40)).slice(0, 30),
    session: o.sessionId.slice(0, 8) + '...',
    created: new Date(o.createdAt).toLocaleString(),
    tokens: o.tokensUsed || '-',
  }));
  
  console.log(formatOutput(data, config));
}

async function listMemories(client: MemoryClient, config: CLIConfig): Promise<void> {
  const results = await client.search({
    agentId: config.agentId,
    limit: 100,
  });
  
  const data = results.memories.map(m => ({
    id: m.id.slice(0, 8) + '...',
    importance: (m.importance * 100).toFixed(0) + '%',
    accessCount: m.accessCount,
    text: m.text.slice(0, 50) + (m.text.length > 50 ? '...' : ''),
    created: new Date(m.createdAt).toLocaleDateString(),
  }));
  
  console.log(formatOutput(data, config));
}

async function searchMemories(
  client: MemoryClient, 
  config: CLIConfig,
  query: string
): Promise<void> {
  const context = await client.getContext({
    query,
    maxTokens: 4000,
    includeRecent: true,
    includeImportant: true,
  });
  
  console.log('\n📚 Relevant Memories:\n');
  if (context.memories.length === 0) {
    console.log('No memories found');
  } else {
    for (const m of context.memories) {
      console.log(`[${(m.importance * 100).toFixed(0)}%] ${m.text}`);
      console.log();
    }
  }
  
  console.log('\n📝 Recent Observations:\n');
  if (context.recentObservations.length === 0) {
    console.log('No recent observations');
  } else {
    for (const o of context.recentObservations.slice(0, 5)) {
      console.log(`[${o.type}] ${o.title || o.text.slice(0, 50)}`);
    }
  }
}

async function getContext(
  client: MemoryClient, 
  config: CLIConfig,
  query: string
): Promise<void> {
  const context = await client.getContext({
    query,
    maxTokens: 2000,
    includeRecent: true,
    includeImportant: true,
  });
  
  console.log('\n=== Context for: "' + query + '" ===\n');
  console.log(`Tokens used: ${context.totalTokens}\n`);
  
  if (context.memories.length > 0) {
    console.log('## Important Memories:\n');
    for (const m of context.memories) {
      console.log(`- ${m.text}`);
    }
    console.log();
  }
  
  if (context.recentObservations.length > 0) {
    console.log('## Recent Observations:\n');
    for (const o of context.recentObservations) {
      console.log(`- [${o.type}] ${o.title || o.text.slice(0, 60)}`);
    }
  }
}

async function showStats(client: MemoryClient, config: CLIConfig): Promise<void> {
  const stats = await client.getStats();
  
  console.log('\n📊 Memory System Statistics\n');
  console.log(`Agent ID: ${config.agentId}`);
  console.log(`Project: ${config.projectId}`);
  console.log(`Storage: ${config.storagePath}\n`);
  console.log(`Total Sessions: ${stats.totalSessions}`);
  console.log(`Total Observations: ${stats.totalObservations}`);
  console.log(`Total Memories: ${stats.totalMemories}`);
}

async function exportMemories(
  client: MemoryClient, 
  config: CLIConfig,
  outputPath?: string
): Promise<void> {
  const results = await client.search({
    agentId: config.agentId,
    limit: 1000,
  });
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    agentId: config.agentId,
    projectId: config.projectId,
    statistics: await client.getStats(),
    memories: results.memories,
    observations: results.observations.map(o => ({
      id: o.id,
      sessionId: o.sessionId,
      type: o.type,
      title: o.title,
      text: o.text,
      facts: o.facts,
      concepts: o.concepts,
      filesRead: o.filesRead,
      filesModified: o.filesModified,
      createdAt: o.createdAt,
    })),
  };
  
  const output = formatAsJSON(exportData);
  
  if (outputPath) {
    const { writeFileSync } = await import('fs');
    writeFileSync(outputPath, output);
    console.log(`Exported to ${outputPath}`);
  } else {
    console.log(output);
  }
}

async function showSessionDetails(
  client: MemoryClient, 
  config: CLIConfig,
  sessionId: string
): Promise<void> {
  const results = await client.search({
    agentId: config.agentId,
    limit: 100,
  });
  
  const observations = results.observations.filter(o => o.sessionId === sessionId);
  
  if (observations.length === 0) {
    console.log(`Session not found: ${sessionId}`);
    return;
  }
  
  const firstObs = observations[0];
  console.log('\n=== Session Details ===\n');
  console.log(`Session ID: ${sessionId}`);
  console.log(`First activity: ${new Date(firstObs.createdAt).toLocaleString()}`);
  console.log(`Total observations: ${observations.length}`);
  
  console.log('## Observations:\n');
  for (const o of observations) {
    console.log(`[${o.type}] ${new Date(o.createdAt).toLocaleTimeString()}`);
    console.log(`  ${o.title || o.text.slice(0, 60)}`);
    if (o.facts && o.facts.length > 0) {
      console.log(`  Facts: ${o.facts.join(', ')}`);
    }
    if (o.filesModified && o.filesModified.length > 0) {
      console.log(`  Modified: ${o.filesModified.join(', ')}`);
    }
    if (o.filesRead && o.filesRead.length > 0) {
      console.log(`  Read: ${o.filesRead.join(', ')}`);
    }
    console.log();
  }
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    printHelp();
    return;
  }
  
  const command = args[0];
  
  // Parse global options
  const config: CLIConfig = { ...DEFAULT_CONFIG };
  const remainingArgs = args.slice(1);
  
  // Parse command-specific options
  let options: Record<string, string | boolean | number> = {};
  let positionalArgs: string[] = [];
  
  for (let i = 0; i < remainingArgs.length; i++) {
    const arg = remainingArgs[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = remainingArgs[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else if (!arg.startsWith('-')) {
      positionalArgs.push(arg);
    }
  }
  
  // Override config from options
  if (options.agentId) config.agentId = options.agentId as string;
  if (options.projectId) config.projectId = options.projectId as string;
  if (options.storagePath) config.storagePath = options.storagePath as string;
  if (options.format === 'json') config.outputFormat = 'json';
  else if (options.format === 'markdown') config.outputFormat = 'markdown';
  
  // Initialize memory client
  const memoryConfig: MemoryConfig = {
    agentId: config.agentId,
    projectId: config.projectId,
    storage: {
      type: 'sqlite',
      path: config.storagePath,
    },
    vector: { type: 'none' },
  };
  
  const memory = new MemoryClient(memoryConfig);
  await memory.initialize();
  
  try {
    switch (command) {
      case 'sessions':
        await listSessions(memory, config);
        break;
        
      case 'observations':
      case 'obs':
        await listObservations(memory, config, {
          sessionId: options.session as string,
          type: options.type as string,
          limit: options.limit as number,
        });
        break;
        
      case 'memories':
        await listMemories(memory, config);
        break;
        
      case 'search':
        if (positionalArgs.length === 0) {
          console.error('Error: search requires a query argument');
          process.exit(1);
        }
        await searchMemories(memory, config, positionalArgs.join(' '));
        break;
        
      case 'context':
        if (positionalArgs.length === 0) {
          console.error('Error: context requires a query argument');
          process.exit(1);
        }
        await getContext(memory, config, positionalArgs.join(' '));
        break;
        
      case 'stats':
        await showStats(memory, config);
        break;
        
      case 'export':
        await exportMemories(memory, config, options.output as string);
        break;
        
      case 'session':
        if (positionalArgs.length === 0) {
          console.error('Error: session requires a session ID argument');
          process.exit(1);
        }
        await showSessionDetails(memory, config, positionalArgs[0]);
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } finally {
    await memory.shutdown();
  }
}

function printHelp(): void {
  const help = [
    'Agent Memory System CLI',
    '',
    'Usage:',
    '  bun run src/cli/index.ts <command> [options]',
    '',
    'Commands:',
    '  sessions                    List all sessions',
    '  observations, obs           List observations (alias: obs)',
    '  memories                    List long-term memories',
    '  search <query>              Search across all memory types',
    '  context <query>             Get context for a specific query',
    '  export [output-file]        Export memories to JSON',
    '  stats                       Show memory statistics',
    '  session <session-id>        Show detailed session info',
    '',
    'Options:',
    '  --agent-id <id>             Agent ID (default: cli-user)',
    '  --project-id <id>           Project ID (default: cli-project)',
    '  --storage-path <path>       Path to SQLite database',
    '  --format <format>           Output format: table (default), json, markdown',
    '  --type <types>              Filter by observation types (comma-separated)',
    '  --session <id>              Filter by session ID',
    '  --limit <n>                 Limit number of results',
    '',
    'Examples:',
    '  bun run src/cli/index.ts stats',
    '  bun run src/cli/index.ts search "user authentication"',
    '  bun run src/cli/index.ts context "fixing login bug"',
    '  bun run src/cli/index.ts observations --type discovery --limit 20',
    '  bun run src/cli/index.ts export --format json > backup.json',
  ].join('\n');
  console.log(help);
}

main().catch(console.error);
