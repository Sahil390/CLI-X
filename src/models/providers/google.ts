import { BaseModelProvider, ModelRequest, ModelResponse } from '../model-provider';
import { ModelError } from '../../utils/errors';

export class GoogleProvider extends BaseModelProvider {
  constructor() { super('google'); }

  get isAvailable(): boolean {
    return !!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }

  async generate(request: ModelRequest): Promise<ModelResponse> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new ModelError('GOOGLE_API_KEY is required for the Gemini provider.');
    }

    const model = process.env.GOOGLE_MODEL ?? 'gemini-2.0-flash';
    const contents = [
      ...(request.systemPrompt
        ? [{ role: 'user', parts: [{ text: request.systemPrompt }] }]
        : []),
      { role: 'user', parts: [{ text: request.prompt }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            ...(request.maxTokens ? { maxOutputTokens: request.maxTokens } : {}),
            ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
          },
        }),
      }
    );

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new ModelError(data.error?.message ?? `Gemini request failed with status ${response.status}.`);
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      throw new ModelError('Gemini returned an empty response.');
    }

    return {
      text,
      provider: this.name,
      model,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount,
        outputTokens: data.usageMetadata?.candidatesTokenCount,
      },
    };
  }
}
