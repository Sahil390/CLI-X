import { WebsiteAgent } from '../agent/website-agent';
import { NotImplementedError } from '../utils/errors';

// ============================================================
// CLI-X — Agent Manager (Application Layer)
// Lifecycle controller for the WebsiteAgent.
// ============================================================

export class AgentManager {
  private agent: WebsiteAgent | null = null;
  private initialized = false;

  /** Initializes the agent and prepares it for use. */
  async initialize(): Promise<void> {
    this.agent = new WebsiteAgent();
    this.initialized = true;
  }

  /** Returns the active agent, initializing if necessary. */
  async getAgent(): Promise<WebsiteAgent> {
    if (!this.initialized || !this.agent) {
      await this.initialize();
    }
    return this.agent!;
  }

  /** Returns true if the agent has been initialized. */
  get isReady(): boolean {
    return this.initialized;
  }

  /** Shuts down the agent (placeholder for cleanup). */
  async shutdown(): Promise<void> {
    this.agent = null;
    this.initialized = false;
  }
}
