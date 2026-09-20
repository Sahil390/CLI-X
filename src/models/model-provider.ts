// ============================================================
// CLI-X — Model Provider Interface
// ============================================================

export type TaskType =
  | 'planning'
  | 'coding'
  | 'ui'
  | 'debugging'
  | 'review'
  | 'simple-edit'
  | 'summarization';

export interface ModelRequest {
  prompt: string;
  systemPrompt?: string;
  taskType?: TaskType;
  context?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelResponse {
  text: string;
  provider: string;
  model?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface ModelProvider {
  readonly name: string;
  readonly isAvailable: boolean;
  generate(request: ModelRequest): Promise<ModelResponse>;
}

export abstract class BaseModelProvider implements ModelProvider {
  readonly name: string;
  abstract get isAvailable(): boolean;

  constructor(name: string) {
    this.name = name;
  }

  async generate(_request: ModelRequest): Promise<ModelResponse> {
    throw new Error(`${this.name} provider is not implemented yet.`);
  }
}
