import { BaseModelProvider, ModelProvider } from './model-provider';

// ============================================================
// CLI-X — Model Registry
// Maintains the registered provider catalog.
// ============================================================

export class ModelRegistry {
  private readonly providers = new Map<string, ModelProvider>();

  register(provider: ModelProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): ModelProvider | undefined {
    return this.providers.get(name);
  }

  has(name: string): boolean {
    return this.providers.has(name);
  }

  list(): ModelProvider[] {
    return [...this.providers.values()];
  }

  listAvailable(): ModelProvider[] {
    return this.list().filter((p) => p.isAvailable);
  }

  names(): string[] {
    return [...this.providers.keys()];
  }
}

// ── Default no-op provider stubs ─────────────────────────────

export class LocalModelProvider extends BaseModelProvider {
  constructor() { super('local'); }

  get isAvailable(): boolean {
    return true;
  }
}

export class CloudModelProvider extends BaseModelProvider {
  constructor() { super('cli-x-cloud'); }

  get isAvailable(): boolean {
    return true;
  }
}
