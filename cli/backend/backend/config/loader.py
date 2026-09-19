import json
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()


def load_global_config(config_path: str = None) -> Dict[str, Any]:
    path = Path(config_path or Path.home() / '.website-builder' / 'config.json')
    if path.exists():
        return json.loads(path.read_text())
    return {'auth': {}, 'build': {'minify': True, 'outputDir': 'dist'}, 'ai': {'provider': 'openai', 'model': 'gpt-4o'}}


def save_global_config(config: Dict[str, Any], config_path: str = None) -> None:
    path = Path(config_path or Path.home() / '.website-builder' / 'config.json')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(config, indent=2))


def load_project_config(config_path: str) -> Dict[str, Any]:
    path = Path(config_path)
    if path.exists():
        return json.loads(path.read_text())
    return {
        'name': 'untitled',
        'template': 'default',
        'build': {'input': 'src', 'output': 'dist'},
        'deploy': {'target': 'local'},
    }
