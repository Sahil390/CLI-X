import { BaseModelProvider, ModelRequest, ModelResponse } from '../model-provider';
import { NotImplementedError } from '../../utils/errors';

// ============================================================
// CLI-X — AWS Bedrock Provider Stub
// Deferred to Step 5 (external integrations).
// Architecture boundary is defined; no live calls yet.
// ============================================================

export type BedrockModelId =
  | 'anthropic.claude-3-5-sonnet-20241022-v2:0'
  | 'anthropic.claude-3-haiku-20240307-v1:0'
  | 'amazon.nova-pro-v1:0'
  | 'amazon.nova-lite-v1:0'
  | 'amazon.titan-text-express-v1'
  | 'meta.llama3-70b-instruct-v1:0';

export interface BedrockConfig {
  region: string;
  modelId: BedrockModelId;
  maxTokens?: number;
}

const DEFAULT_CONFIG: BedrockConfig = {
  region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  maxTokens: 4096,
};

export class BedrockProvider extends BaseModelProvider {
  readonly config: BedrockConfig;

  constructor(config: Partial<BedrockConfig> = {}) {
    super('bedrock');
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** True if AWS credentials are detectable via environment. */
  get isAvailable(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID ||
      process.env.AWS_PROFILE ||
      process.env.AWS_WEB_IDENTITY_TOKEN_FILE
    );
  }

  async generate(_request: ModelRequest): Promise<ModelResponse> {
    throw new NotImplementedError(
      `AWS Bedrock (${this.config.modelId}) invocation`
    );
  }

  /** Lists all supported model IDs for reference. */
  static supportedModels(): BedrockModelId[] {
    return [
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'anthropic.claude-3-haiku-20240307-v1:0',
      'amazon.nova-pro-v1:0',
      'amazon.nova-lite-v1:0',
      'amazon.titan-text-express-v1',
      'meta.llama3-70b-instruct-v1:0',
    ];
  }
}
