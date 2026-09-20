import * as fs from 'fs';
import * as path from 'path';
import { FilesystemTool } from '../tools/filesystem';
import { ToolError } from '../utils/errors';

// ============================================================
// CLI-X — Chat History
// Persists conversation messages in JSONL format at
// .ai/chat/messages.jsonl inside the project directory.
// ============================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class ChatHistory {
  private readonly messagesPath: string;

  constructor(projectRoot: string) {
    this.messagesPath = path.join(projectRoot, '.ai', 'chat', 'messages.jsonl');
  }

  /** Ensures the .ai/chat/ directory and messages.jsonl file exist. */
  async initialize(): Promise<void> {
    const dir = path.dirname(this.messagesPath);
    await FilesystemTool.makeDir(dir);
    if (!FilesystemTool.exists(this.messagesPath)) {
      await FilesystemTool.writeFile(this.messagesPath, '');
    }
  }

  /** Appends a single message to the JSONL file. */
  async append(role: MessageRole, content: string, metadata?: Record<string, unknown>): Promise<ChatMessage> {
    const message: ChatMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
      ...(metadata ? { metadata } : {}),
    };
    const line = JSON.stringify(message) + '\n';
    await FilesystemTool.appendFile(this.messagesPath, line);
    return message;
  }

  /** Reads all messages from the JSONL file. */
  async readAll(): Promise<ChatMessage[]> {
    if (!FilesystemTool.exists(this.messagesPath)) return [];

    try {
      const raw = await FilesystemTool.readFile(this.messagesPath);
      return raw
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => JSON.parse(line) as ChatMessage);
    } catch (e) {
      throw new ToolError(`Failed to read chat history: ${(e as Error).message}`);
    }
  }

  /** Returns the most recent N messages. */
  async getRecent(n = 20): Promise<ChatMessage[]> {
    const all = await this.readAll();
    return all.slice(-n);
  }

  /** Returns the total message count. */
  async count(): Promise<number> {
    const all = await this.readAll();
    return all.length;
  }

  /** Clears the chat history. */
  async clear(): Promise<void> {
    await FilesystemTool.writeFile(this.messagesPath, '');
  }

  /** Returns the file path of the chat history. */
  get path(): string {
    return this.messagesPath;
  }
}
