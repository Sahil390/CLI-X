import { ChatHistory, ChatMessage, MessageRole } from '../project/chat-history';

// ============================================================
// CLI-X — Session Manager (Application Layer)
// Manages in-memory conversation state + delegates
// persistence to ChatHistory (JSONL).
// ============================================================

export type { ChatMessage };

export class SessionManager {
  private readonly inMemory: ChatMessage[] = [];
  private chatHistory: ChatHistory | null = null;

  /** Binds a project root so messages are persisted to .ai/chat/ */
  async bindProject(projectRoot: string): Promise<void> {
    this.chatHistory = new ChatHistory(projectRoot);
    await this.chatHistory.initialize();
  }

  /** Adds a message to in-memory state and (if bound) to JSONL persistence. */
  async addMessage(role: MessageRole, content: string): Promise<ChatMessage> {
    const message: ChatMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    this.inMemory.push(message);

    if (this.chatHistory) {
      await this.chatHistory.append(role, content);
    }

    return message;
  }

  /** Returns in-memory messages from this session. */
  getMessages(): ChatMessage[] {
    return [...this.inMemory];
  }

  /** Returns all messages from persistent storage (if bound). */
  async getPersistentMessages(limit = 50): Promise<ChatMessage[]> {
    if (!this.chatHistory) return [];
    return this.chatHistory.getRecent(limit);
  }

  /** Returns true if a project is bound for persistence. */
  get isPersistent(): boolean {
    return this.chatHistory !== null;
  }

  /** Clears in-memory messages. */
  clear(): void {
    this.inMemory.length = 0;
  }
}
