import { ModelRegistry, LocalModelProvider, CloudModelProvider } from '../src/models/model-registry';
import { ModelRouter } from '../src/models/model-router';
import { ModelGateway } from '../src/models/model-gateway';
import { BedrockProvider } from '../src/models/providers/bedrock';
import { GoogleProvider } from '../src/models/providers/google';
import { NotImplementedError } from '../src/utils/errors';

// Migrated from cli/tests/model.test.ts with updated import paths

describe('Model layer', () => {
  it('registers providers in registry', () => {
    const registry = new ModelRegistry();
    registry.register(new LocalModelProvider());
    registry.register(new CloudModelProvider());

    expect(registry.names()).toContain('local');
    expect(registry.names()).toContain('cli-x-cloud');
    expect(registry.list()).toHaveLength(2);
  });

  it('routes coding task to first available provider', () => {
    const registry = new ModelRegistry();
    registry.register(new LocalModelProvider());

    const router = new ModelRouter(
      new Map(registry.list().map((p) => [p.name, p]))
    );

    const provider = router.route('coding');
    expect(provider.name).toBeDefined();
  });

  it('gateway lists all registered providers', () => {
    const gateway = new ModelGateway();
    const providers = gateway.listProviders();
    expect(providers).toContain('bedrock');
    expect(providers).toContain('openai');
    expect(providers).toContain('anthropic');
    expect(providers).toContain('google');
    expect(providers).toContain('local');
  });

  it('bedrock provider stub throws NotImplementedError', async () => {
    const bedrock = new BedrockProvider();
    await expect(
      bedrock.generate({ prompt: 'test' })
    ).rejects.toThrow(NotImplementedError);
  });

  it('bedrock provider detects AWS credentials via env', () => {
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    const bedrock = new BedrockProvider();
    expect(bedrock.isAvailable).toBe(true);
    delete process.env.AWS_ACCESS_KEY_ID;
  });

  it('google provider detects a Gemini API key via env', () => {
    process.env.GOOGLE_API_KEY = 'test-key';
    const google = new GoogleProvider();
    expect(google.isAvailable).toBe(true);
    delete process.env.GOOGLE_API_KEY;
  });

  it('bedrock provider supports expected model catalog', () => {
    const models = BedrockProvider.supportedModels();
    expect(models).toContain('anthropic.claude-3-5-sonnet-20241022-v2:0');
    expect(models).toContain('amazon.nova-pro-v1:0');
  });
});
