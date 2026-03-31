/**
 * Agent Pool - Resource Management
 */

import type {
  AgentProfile,
  AgentCapabilities,
  AgentPerformance,
  AgentRole,
  AgentStatus,
} from './index.ts';

const generateAgentId = () => `agent_${Math.random().toString(36).slice(2, 8)}`;

export interface AgentRequirements {
  taskType?: string;
  requiredCapabilities?: string[];
  availability?: boolean;
  speciality?: string;
}

export class AgentPool {
  private agents: Map<string, AgentProfile> = new Map();
  private busyAgents: Map<string, string> = new Map();  // agentId -> taskId
  
  constructor() {
    // Initialize with default agents
    this.registerDefaultAgents();
  }
  
  /**
   * Register a new agent
   */
  registerAgent(profile: Partial<AgentProfile>): AgentProfile {
    const agent: AgentProfile = {
      id: profile.id || generateAgentId(),
      name: profile.name || `Agent-${profile.role || 'dev'}`,
      role: profile.role || 'dev',
      capabilities: profile.capabilities || this.getDefaultCapabilities(profile.role || 'dev'),
      performance: profile.performance || this.getDefaultPerformance(),
      status: 'idle',
      currentTasks: [],
    };
    
    this.agents.set(agent.id, agent);
    console.log(`[AgentPool] Registered agent: ${agent.name} (${agent.role})`);
    
    return agent;
  }
  
  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.busyAgents.delete(agentId);
    console.log(`[AgentPool] Unregistered agent: ${agentId}`);
  }
  
  /**
   * Find best agent for requirements
   */
  findBestAgent(requirements: AgentRequirements): AgentProfile | null {
    const candidates = this.agents.values().toArray()
      .filter(agent => this.matchesRequirements(agent, requirements));
    
    if (candidates.length === 0) {
      return null;
    }
    
    // Sort by performance and pick best
    candidates.sort((a, b) => {
      // Prefer idle agents
      if (a.status === 'idle' && b.status !== 'idle') return -1;
      if (a.status !== 'idle' && b.status === 'idle') return 1;
      
      // Then by success rate
      return b.performance.successRate - a.performance.successRate;
    });
    
    return candidates[0];
  }
  
  /**
   * Get agent status
   */
  getAgentStatus(agentId: string): AgentStatus {
    const agent = this.agents.get(agentId);
    return agent?.status || 'offline';
  }
  
  /**
   * Set agent busy
   */
  setAgentBusy(agentId: string, taskId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    agent.status = 'busy';
    agent.currentTasks.push(taskId);
    this.busyAgents.set(agentId, taskId);
    
    console.log(`[AgentPool] ${agent.name} now busy with task: ${taskId}`);
  }
  
  /**
   * Set agent idle
   */
  setAgentIdle(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    agent.status = 'idle';
    this.busyAgents.delete(agentId);
    
    console.log(`[AgentPool] ${agent.name} now idle`);
  }
  
  /**
   * Get all agents
   */
  getAgents(): AgentProfile[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * Get available agents
   */
  getAvailableAgents(): AgentProfile[] {
    return Array.from(this.agents.values()).filter(a => a.status === 'idle');
  }
  
  /**
   * Get busy agents
   */
  getBusyAgents(): AgentProfile[] {
    return Array.from(this.agents.values()).filter(a => a.status === 'busy');
  }
  
  // ========================================
  // Private Methods
  // ========================================
  
  private matchesRequirements(agent: AgentProfile, requirements: AgentRequirements): boolean {
    // Check availability
    if (requirements.availability && agent.status !== 'idle') {
      return false;
    }
    
    // Check task type
    if (requirements.taskType) {
      if (!agent.capabilities.taskTypes.includes(requirements.taskType as any)) {
        return false;
      }
    }
    
    // Check capabilities
    if (requirements.requiredCapabilities) {
      for (const cap of requirements.requiredCapabilities) {
        if (!agent.capabilities.tools.some(t => t.includes(cap))) {
          return false;
        }
      }
    }
    
    // Check speciality
    if (requirements.speciality) {
      if (!agent.capabilities.specialities.includes(requirements.speciality)) {
        return false;
      }
    }
    
    // Check concurrent capacity
    if (agent.currentTasks.length >= agent.capabilities.maxConcurrent) {
      return false;
    }
    
    return true;
  }
  
  private getDefaultCapabilities(role: AgentRole): AgentCapabilities {
    const defaults: Record<AgentRole, AgentCapabilities> = {
      dev: {
        taskTypes: ['code', 'mixed'],
        tools: ['edit', 'read', 'exec', 'write'],
        maxConcurrent: 2,
        specialities: ['frontend', 'backend', 'api'],
      },
      pm: {
        taskTypes: ['analysis', 'research', 'creative'],
        tools: ['read', 'web_search', 'web_fetch'],
        maxConcurrent: 3,
        specialities: ['requirements', 'planning', 'documentation'],
      },
      designer: {
        taskTypes: ['creative', 'analysis'],
        tools: ['image_generate', 'read', 'write'],
        maxConcurrent: 2,
        specialities: ['ui', 'ux', 'graphics'],
      },
      researcher: {
        taskTypes: ['research', 'analysis'],
        tools: ['web_search', 'web_fetch', 'read'],
        maxConcurrent: 4,
        specialities: ['market', 'technical', 'user'],
      },
      reviewer: {
        taskTypes: ['analysis', 'code'],
        tools: ['read', 'exec'],
        maxConcurrent: 3,
        specialities: ['code-review', 'testing', 'security'],
      },
      devops: {
        taskTypes: ['code', 'mixed'],
        tools: ['exec', 'read', 'write'],
        maxConcurrent: 2,
        specialities: ['deployment', 'monitoring', 'ci-cd'],
      },
    };
    
    return defaults[role] || defaults.dev;
  }
  
  private getDefaultPerformance(): AgentPerformance {
    return {
      avgCompletionTime: 120,  // 2 minutes
      successRate: 0.85,
      totalTasksCompleted: 0,
    };
  }
  
  private registerDefaultAgents(): void {
    // Register team agents
    this.registerAgent({
      id: 'agent_dev_ekko',
      name: '艾克',
      role: 'dev',
      capabilities: {
        taskTypes: ['code', 'mixed', 'analysis'],
        tools: ['edit', 'read', 'exec', 'write', 'sessions_spawn'],
        maxConcurrent: 3,
        specialities: ['frontend', 'backend', 'typescript', 'python'],
      },
    });
    
    this.registerAgent({
      id: 'agent_pm_jinx',
      name: '金克丝',
      role: 'pm',
      capabilities: {
        taskTypes: ['research', 'analysis', 'creative'],
        tools: ['read', 'web_search', 'web_fetch', 'write'],
        maxConcurrent: 4,
        specialities: ['planning', 'requirements', 'documentation'],
      },
    });
    
    this.registerAgent({
      id: 'agent_devops_caitlyn',
      name: '凯特琳',
      role: 'devops',
      capabilities: {
        taskTypes: ['code', 'mixed'],
        tools: ['exec', 'read', 'write', 'process'],
        maxConcurrent: 2,
        specialities: ['testing', 'deployment', 'monitoring'],
      },
    });
    
    this.registerAgent({
      id: 'agent_director_vi',
      name: '蔚',
      role: 'dev',
      capabilities: {
        taskTypes: ['code', 'research', 'analysis', 'mixed', 'creative'],
        tools: ['*'],  // all tools
        maxConcurrent: 5,
        specialities: ['orchestration', 'coordination', 'architecture'],
      },
    });
  }
}