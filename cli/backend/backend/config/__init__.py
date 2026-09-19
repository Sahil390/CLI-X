from pathlib import Path
import json
from typing import Dict, Any

HOME = Path.home()
CONFIG_DIR = HOME / '.website-builder'
CONFIG_FILE = CONFIG_DIR / 'config.json'


def load_config() -> Dict[str, Any]:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {}


def save_config(config: Dict[str, Any]) -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(config, indent=2))


def expand_path(p: str) -> str:
    return p.replace('~', str(HOME))
