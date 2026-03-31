/**
 * Shared Context - Cross-Agent Communication
 */

import type { AgentMessage, MessageType } from './index.ts';

const generateMsgId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export interface ContextChange {
  key: string;
  oldValue: any;
  newValue: any;
  changedBy: string;  // agent ID
  timestamp: Date;
  version: number;
}

export interface Subscription {
  id: string;
  agentId: string;
  keys: string[];  // subscribed keys
  callback: (change: ContextChange) => void;
}

export class SharedContext {
  private taskId: string;
  private data: Map<string, any> = new Map();
  private versions: Map<string, number> = new Map();
  private history: Map<string, ContextChange[]> = new Map();
  private subscriptions: Map<string, Subscription[]> = new Map();
  
  constructor(taskId: string) {
    this.taskId = taskId;
  }
  
  /**
   * Set a value
   */
  set(key: string, value: any, agentId?: string): ContextChange {
    const oldVersion = this.versions.get(key) || 0;
    const newVersion = oldVersion + 1;
    
    const change: ContextChange = {
      key,
      oldValue: this.data.get(key),
      newValue: value,
      changedBy: agentId || 'system',
      timestamp: new Date(),
      version: newVersion,
    };
    
    // Update data
    this.data.set(key, value);
    this.versions.set(key, newVersion);
    
    // Record history
    const keyHistory = this.history.get(key) || [];
    keyHistory.push(change);
    this.history.set(key, keyHistory);
    
    // Broadcast change
    this.broadcastChange(change);
    
    return change;
  }
  
  /**
   * Get a value
   */
  get(key: string): any {
    return this.data.get(key);
  }
  
  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.data.has(key);
  }
  
  /**
   * Delete a value
   */
  delete(key: string, agentId?: string): boolean {
    if (!this.data.has(key)) return false;
    
    this.set(key, undefined, agentId);
    this.data.delete(key);
    
    return true;
  }
  
  /**
   * Get version
   */
  getVersion(key: string): number {
    return this.versions.get(key) || 0;
  }
  
  /**
   * Get history
   */
  getHistory(key: string): ContextChange[] {
    return this.history.get(key) || [];
  }
  
  /**
   * Subscribe to changes
   */
  subscribe(agentId: string, keys: string[], callback: (change: ContextChange) => void): string {
    const subscriptionId = generateMsgId();
    
    const subscription: Subscription = {
      id: subscriptionId,
      agentId,
      keys,
      callback,
    };
    
    for (const key of keys) {
      const subs = this.subscriptions.get(key) || [];
      subs.push(subscription);
      this.subscriptions.set(key, subs);
    }
    
    return subscriptionId;
  }
  
  /**
   * Unsubscribe
   */
  unsubscribe(subscriptionId: string): void {
    for (const [key, subs] of this.subscriptions.entries()) {
      const filtered = subs.filter(s => s.id !== subscriptionId);
      this.subscriptions.set(key, filtered);
    }
  }
  
  /**
   * Get all data as object
   */
  toObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const [key, value] of this.data.entries()) {
      obj[key] = value;
    }
    return obj;
  }
  
  /**
   * Import data from object
   */
  fromObject(obj: Record<string, any>, agentId?: string): void {
    for (const [key, value] of Object.entries(obj)) {
      this.set(key, value, agentId);
    }
  }
  
  /**
   * Get relevant context for agent
   */
  getRelevant(keys: string[]): Record<string, any> {
    const relevant: Record<string, any> = {};
    for (const key of keys) {
      if (this.data.has(key)) {
        relevant[key] = this.data.get(key);
      }
    }
    return relevant;
  }
  
  // ========================================
  // Private Methods
  // ========================================
  
  private broadcastChange(change: ContextChange): void {
    const subs = this.subscriptions.get(change.key) || [];
    
    for (const sub of subs) {
      if (sub.keys.includes(change.key)) {
        sub.callback(change);
      }
    }
  }
}

/**
 * Message Bus - Agent Communication
 */
export class MessageBus {
  private taskId: string;
  private messages: AgentMessage[] = [];
  private listeners: Map<string, (msg: AgentMessage) => void> = new Map();
  
  constructor(taskId: string) {
    this.taskId = taskId;
  }
  
  /**
   * Send a message
   */
  send(message: Omit<AgentMessage, 'id' | 'timestamp'>): AgentMessage {
    const fullMessage: AgentMessage = {
      id: generateMsgId(),
      from: message.from,
      to: message.to,
      type: message.type,
      content: message.content,
      timestamp: new Date(),
      taskId: this.taskId,
    };
    
    this.messages.push(fullMessage);
    
    // Deliver to recipient
    if (message.to === 'broadcast') {
      // Broadcast to all listeners
      for (const [agentId, callback] of this.listeners.entries()) {
        if (agentId !== message.from) {
          callback(fullMessage);
        }
      }
    } else {
      // Direct message
      const callback = this.listeners.get(message.to);
      if (callback) {
        callback(fullMessage);
      }
    }
    
    return fullMessage;
  }
  
  /**
   * Register listener for an agent
   */
  listen(agentId: string, callback: (msg: AgentMessage) => void): void {
    this.listeners.set(agentId, callback);
  }
  
  /**
   * Unregister listener
   */
  unlisten(agentId: string): void {
    this.listeners.delete(agentId);
  }
  
  /**
   * Get messages for an agent
   */
  getMessages(agentId: string, type?: MessageType): AgentMessage[] {
    return this.messages.filter(msg => 
      msg.to === agentId || msg.to === 'broadcast'
    ).filter(msg => !type || msg.type === type);
  }
  
  /**
   * Get all messages
   */
  getAllMessages(): AgentMessage[] {
    return this.messages;
  }
  
  /**
   * Clear messages
   */
  clear(): void {
    this.messages = [];
  }
}