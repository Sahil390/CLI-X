from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        pass

    @abstractmethod
    def stream_generate(self, prompt: str, **kwargs):
        pass


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = 'gpt-4o'):
        self.api_key = api_key or __import__('os').environ.get('OPENAI_API_KEY')
        self.model = model

    def generate(self, prompt: str, **kwargs) -> str:
        import openai
        client = openai.OpenAI(api_key=self.api_key)
        response = client.chat.completions.create(
            model=self.model,
            messages=[{'role': 'user', 'content': prompt}],
        )
        return response.choices[0].message.content

    def stream_generate(self, prompt: str, **kwargs):
        import openai
        client = openai.OpenAI(api_key=self.api_key)
        stream = client.chat.completions.create(
            model=self.model,
            messages=[{'role': 'user', 'content': prompt}],
            stream=True,
        )
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content


class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = 'claude-3-5-sonnet-20241022'):
        self.api_key = api_key or __import__('os').environ.get('ANTHROPIC_API_KEY')
        self.model = model

    def generate(self, prompt: str, **kwargs) -> str:
        import anthropic
        client = anthropic.Anthropic(api_key=self.api_key)
        response = client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{'role': 'user', 'content': prompt}],
        )
        return response.content[0].text

    def stream_generate(self, prompt: str, **kwargs):
        import anthropic
        client = anthropic.Anthropic(api_key=self.api_key)
        stream = client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{'role': 'user', 'content': prompt}],
            stream=True,
        )
        for event in stream:
            if hasattr(event, 'delta') and event.delta and event.delta.text:
                yield event.delta.text


class LocalProvider(LLMProvider):
    def __init__(self, base_url: str = 'http://localhost:11434', model: str = 'llama3'):
        self.base_url = base_url.rstrip('/')
        self.model = model

    def generate(self, prompt: str, **kwargs) -> str:
        import requests
        response = requests.post(f'{self.base_url}/api/generate', json={
            'model': self.model,
            'prompt': prompt,
            'stream': False,
        })
        if response.ok:
            return response.json().get('response', '')
        return f'Error: {response.status_code}'

    def stream_generate(self, prompt: str, **kwargs):
        import requests
        with requests.post(f'{self.base_url}/api/generate', json={
            'model': self.model,
            'prompt': prompt,
            'stream': True,
        }, stream=True) as response:
            for line in response.iter_lines():
                if line:
                    import json
                    try:
                        data = json.loads(line)
                        yield data.get('response', '')
                    except json.JSONDecodeError:
                        pass


PROVIDERS = {
    'openai': OpenAIProvider,
    'anthropic': AnthropicProvider,
    'local': LocalProvider,
}


def get_provider(name: str, **kwargs) -> LLMProvider:
    cls = PROVIDERS.get(name)
    if not cls:
        raise ValueError(f'Unknown provider: {name}')
    return cls(**kwargs)
