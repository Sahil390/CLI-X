import { ModelRegistry } from './model-registry';
import { ModelRouter } from './model-router';
import { BedrockProvider } from './providers/bedrock';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { LocalModelProvider } from './model-registry';
import type { ModelRequest, ModelResponse, TaskType } from './model-provider';

// ============================================================
// CLI-X — Model Gateway
// Single entry point for all model interactions.
// Manages registry + router and exposes a clean generate() API.
// ============================================================

export class ModelGateway {
  private readonly registry: ModelRegistry;
  private readonly router: ModelRouter;

  constructor() {
    this.registry = new ModelRegistry();

    // Register all available providers
    this.registry.register(new BedrockProvider());
    this.registry.register(new OpenAIProvider());
    this.registry.register(new AnthropicProvider());
    this.registry.register(new GoogleProvider());
    this.registry.register(new LocalModelProvider());

    this.router = new ModelRouter(
      new Map(this.registry.list().map((p) => [p.name, p]))
    );
  }

  /** Generates a response, routing to the best available provider. */
  async generate(request: ModelRequest): Promise<ModelResponse> {
    return this.router.generate(request);
  }

  /** Returns the list of all registered provider names. */
  listProviders(): string[] {
    return this.registry.names();
  }

  /** Returns only providers marked as available. */
  listAvailableProviders(): string[] {
    return this.registry.listAvailable().map((p) => p.name);
  }

  /** Returns the provider that would be selected for a given task type. */
  resolveProvider(taskType: TaskType): string {
    try {
      return this.router.route(taskType).name;
    } catch {
      return 'none';
    }
  }
}
