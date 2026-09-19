from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import json

from ai.generator import generate_site


def create_app() -> FastAPI:
    app = FastAPI(title="Website Builder API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    @app.post("/v1/generate")
    async def generate(request: Dict[str, Any]) -> Dict[str, Any]:
        prompt = request.get('prompt', '')
        style = request.get('style', 'modern')
        template = request.get('template', 'default')

        if not prompt:
            return {"error": "prompt is required"}

        try:
            result = generate_site(prompt, style, template)
            return result
        except Exception as e:
            return {"error": str(e)}

    @app.post("/v1/generate-stream")
    async def generate_stream(request: Dict[str, Any]):
        import asyncio

        async def stream():
            prompt = request.get('prompt', '')
            style = request.get('style', 'modern')
            template = request.get('template', 'default')

            if not prompt:
                yield f"data: {json.dumps({'error': 'prompt is required'})}\n\n"
                return

            try:
                result = generate_site(prompt, style, template)
                for key in ['html', 'css', 'js']:
                    if key in result:
                        chunk = {'type': key, 'content': result[key][:100]}
                        yield f"data: {json.dumps(chunk)}\n\n"
                        await asyncio.sleep(0.05)
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return stream()

    @app.get("/v1/templates")
    async def list_templates():
        return {
            'templates': [
                {'name': 'default', 'description': 'A clean static site'},
                {'name': 'blog', 'description': 'A blog template'},
                {'name': 'portfolio', 'description': 'A portfolio site'},
            ]
        }

    return app


if __name__ == '__main__':
    import uvicorn
    app = create_app()
    uvicorn.run(app, host='localhost', port=8420)
