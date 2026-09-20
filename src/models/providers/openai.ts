import { BaseModelProvider, ModelRequest, ModelResponse } from '../model-provider';
import { NotImplementedError } from '../../utils/errors';

export class OpenAIProvider extends BaseModelProvider {
  constructor() { super('openai'); }

  get isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async generate(_request: ModelRequest): Promise<ModelResponse> {
    throw new NotImplementedError('OpenAI provider invocation');
  }
}
