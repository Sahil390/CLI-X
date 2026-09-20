import { BaseModelProvider, ModelRequest, ModelResponse } from '../model-provider';
import { NotImplementedError } from '../../utils/errors';

export class LocalProvider extends BaseModelProvider {
  constructor() { super('local'); }

  get isAvailable(): boolean {
    return !!(process.env.LOCAL_LLM_URL);
  }

  async generate(_request: ModelRequest): Promise<ModelResponse> {
    throw new NotImplementedError('Local LLM provider invocation');
  }
}
