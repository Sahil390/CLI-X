"""Website Builder - Python Backend"""
from fastapi import FastAPI
from backend.api.server import create_app

app = create_app()

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='localhost', port=8420)
