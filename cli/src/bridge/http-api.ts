import { DEFAULT_PORT } from '../types/index.js';

export interface GenerateRequest {
  prompt: string;
  style?: string;
  template?: string;
}

export interface GenerateResponse {
  html?: string;
  css?: string;
  js?: string;
  files?: Record<string, string>;
  error?: string;
}

export class HttpApiClient {
  private baseUrl: string;

  constructor(port: number = DEFAULT_PORT) {
    this.baseUrl = `http://localhost:${port}`;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${this.baseUrl}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${this.baseUrl}/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `API error ${response.status}: ${errorText}` };
      }

      const data = await response.json() as GenerateResponse;
      return data;
    } catch (err: any) {
      clearTimeout(timeout);
      return { error: err.message || 'API request failed' };
    }
  }

  async generateStream(
    request: GenerateRequest,
    onChunk: (chunk: string) => void,
  ): Promise<GenerateResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${this.baseUrl}/v1/generate-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `API error ${response.status}: ${errorText}` };
      }

      const reader = response.body?.getReader();
      if (!reader) {
        return { error: 'No response body' };
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(typeof data === 'string' ? data : JSON.stringify(data));
            } catch {
              onChunk(line.slice(6));
            }
          }
        }
      }

      return {};
    } catch (err: any) {
      clearTimeout(timeout);
      return { error: err.message };
    }
  }
}
