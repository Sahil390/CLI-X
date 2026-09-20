import type { ModelRequest, ModelResponse, ModelProvider, TaskType } from './model-provider';

// ============================================================
// CLI-X — Model Router
// Routes requests to the best available provider
// based on task type and provider priority.
// ============================================================

const PROVIDER_PRIORITY: Record<TaskType, string[]> = {
  planning:      ['anthropic', 'openai', 'bedrock', 'google', 'local'],
  coding:        ['anthropic', 'openai', 'bedrock', 'google', 'local'],
  ui:            ['openai',    'anthropic', 'google', 'bedrock', 'local'],
  debugging:     ['anthropic', 'openai', 'bedrock', 'local'],
  review:        ['anthropic', 'openai', 'bedrock', 'google', 'local'],
  'simple-edit': ['local',    'openai', 'anthropic', 'bedrock'],
  summarization: ['google',   'anthropic', 'openai', 'bedrock', 'local'],
};

export class ModelRouter {
  constructor(private readonly providers: Map<string, ModelProvider>) {}

  /** Returns the highest-priority available provider for the given task. */
  route(taskType: TaskType = 'coding'): ModelProvider {
    const priority = PROVIDER_PRIORITY[taskType] ?? ['local'];
    const match = priority.find((name) => this.providers.has(name));

    if (!match) {
      throw new Error('No model providers registered. Configure a provider with "cli-x config".');
    }

    return this.providers.get(match)!;
  }

  /** Routes and generates a response for the given request. */
  async generate(request: ModelRequest): Promise<ModelResponse> {
    const taskType = request.taskType ?? 'coding';
    const provider = this.route(taskType);
    return provider.generate(request);
  }
}
