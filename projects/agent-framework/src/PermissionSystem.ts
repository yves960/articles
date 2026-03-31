/**
 * Permission System - Access Control
 */

import type { Permission, PermissionPolicy, PermissionDecision, PermissionConstraints } from './index.ts';

export const DEFAULT_POLICY: PermissionPolicy = {
  autoAllow: [
    { type: 'file_read' },
    { type: 'memory_read' },
    { type: 'memory_write' },
    { type: 'web_fetch' },
  ],
  requireConfirmation: [
    { type: 'file_write' },
    { type: 'file_delete' },
    { type: 'command_execute' },
    { type: 'network_request' },
  ],
  autoDeny: [
    { type: 'system_modify' },
    { type: 'credential_access' },
  ],
};

export class PermissionSystem {
  private policy: PermissionPolicy;
  private sessionApprovals: Map<string, boolean> = new Map();
  private confirmationCallback?: (permission: Permission) => Promise<boolean>;
  
  constructor(policy: PermissionPolicy = DEFAULT_POLICY) {
    this.policy = policy;
  }
  
  /**
   * Set confirmation callback for user interaction
   */
  onConfirm(callback: (permission: Permission) => Promise<boolean>): void {
    this.confirmationCallback = callback;
  }
  
  /**
   * Check if permission is allowed
   */
  check(permission: Permission): PermissionDecision {
    // Check auto-deny first
    if (this.matchesAny(permission, this.policy.autoDeny)) {
      return 'deny';
    }
    
    // Check auto-allow
    if (this.matchesAny(permission, this.policy.autoAllow)) {
      return 'allow';
    }
    
    // Check require-confirmation
    if (this.matchesAny(permission, this.policy.requireConfirmation)) {
      return 'confirm';
    }
    
    // Default: confirm
    return 'confirm';
  }
  
  /**
   * Request permission (with confirmation if needed)
   */
  async request(permission: Permission): Promise<boolean> {
    const decision = this.check(permission);
    
    switch (decision) {
      case 'allow':
        return true;
        
      case 'deny':
        return false;
        
      case 'confirm':
        // Check session approval cache
        const cacheKey = this.getCacheKey(permission);
        if (this.sessionApprovals.has(cacheKey)) {
          return this.sessionApprovals.get(cacheKey)!;
        }
        
        // Ask user
        if (this.confirmationCallback) {
          const approved = await this.confirmationCallback(permission);
          this.sessionApprovals.set(cacheKey, approved);
          return approved;
        }
        
        // No callback = deny
        return false;
        
      default:
        return false;
    }
  }
  
  /**
   * Clear session approvals
   */
  clearApprovals(): void {
    this.sessionApprovals.clear();
  }
  
  /**
   * Check if a permission is in a list
   */
  private matchesAny(permission: Permission, list: Permission[]): boolean {
    for (const p of list) {
      if (this.matches(permission, p)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check if two permissions match
   */
  private matches(actual: Permission, pattern: Permission): boolean {
    // Type must match
    if (actual.type !== pattern.type) return false;
    
    // Check constraints
    if (pattern.constraints && actual.constraints) {
      if (pattern.constraints.allowedPaths) {
        const resource = actual.resource || '';
        const allowed = pattern.constraints.allowedPaths.some(p => resource.startsWith(p));
        if (!allowed) return false;
      }
      
      if (pattern.constraints.allowedCommands) {
        const resource = actual.resource || '';
        const allowed = pattern.constraints.allowedCommands.some(c => resource.startsWith(c));
        if (!allowed) return false;
      }
    }
    
    return true;
  }
  
  /**
   * Generate cache key for approval
   */
  private getCacheKey(permission: Permission): string {
    return `${permission.type}:${permission.resource || '*'}`;
  }
}

/**
 * Create permission from tool and input
 */
export function createPermission(type: string, resource?: string, constraints?: PermissionConstraints): Permission {
  return { type, resource, constraints };
}

/**
 * Common permissions
 */
export const PERMISSIONS = {
  readFile: (path: string): Permission => ({ type: 'file_read', resource: path }),
  writeFile: (path: string): Permission => ({ type: 'file_write', resource: path }),
  deleteFile: (path: string): Permission => ({ type: 'file_delete', resource: path }),
  executeCommand: (cmd: string): Permission => ({ type: 'command_execute', resource: cmd }),
  networkRequest: (url: string): Permission => ({ type: 'network_request', resource: url }),
};