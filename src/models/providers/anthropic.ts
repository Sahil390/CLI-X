import { BaseModelProvider, ModelRequest, ModelResponse } from '../model-provider';
import { NotImplementedError } from '../../utils/errors';

export class AnthropicProvider extends BaseModelProvider {
  constructor() { super('anthropic'); }

  get isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async generate(_request: ModelRequest): Promise<ModelResponse> {
    throw new NotImplementedError('Anthropic provider invocation');
  }
}
