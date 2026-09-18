import json
import os
import time
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

HOME = Path.home()
CONFIG_DIR = HOME / '.website-builder'
SESSION_FILE = CONFIG_DIR / 'session.json'


class SessionManager:
    def __init__(self, config_dir: Path = CONFIG_DIR):
        self.config_dir = config_dir
        self.session_file = config_dir / 'session.json'
        self.config_dir.mkdir(parents=True, exist_ok=True)

    def load(self, provider: str) -> Optional[Dict[str, Any]]:
        if not self.session_file.exists():
            return None
        try:
            data = json.loads(self.session_file.read_text())
            session = data.get(provider)
            if session and self._is_expired(session):
                self._refresh(provider)
                return self.load(provider)
            return session
        except (json.JSONDecodeError, OSError):
            return None

    def save(self, provider: str, session: Dict[str, Any]) -> None:
        data = {}
        if self.session_file.exists():
            try:
                data = json.loads(self.session_file.read_text())
            except (json.JSONDecodeError, OSError):
                pass
        data[provider] = session
        self.session_file.write_text(json.dumps(data, indent=2))

    def clear(self, provider: Optional[str] = None) -> None:
        if provider:
            data = self.load_all()
            data.pop(provider, None)
            self.session_file.write_text(json.dumps(data, indent=2))
        else:
            if self.session_file.exists():
                self.session_file.unlink()

    def load_all(self) -> Dict[str, Any]:
        if not self.session_file.exists():
            return {}
        try:
            return json.loads(self.session_file.read_text())
        except (json.JSONDecodeError, OSError):
            return {}

    def _is_expired(self, session: Dict[str, Any]) -> bool:
        expires_at = session.get('expires_at')
        if not expires_at:
            return False
        return time.time() > _parse_iso(expires_at)

    def _refresh(self, provider: str) -> None:
        pass


def _parse_iso(date_str: str) -> float:
    try:
        from datetime import datetime
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.timestamp()
    except (ValueError, AttributeError):
        return 0


def get_token(provider: str) -> Optional[str]:
    mgr = SessionManager()
    session = mgr.load(provider)
    return session.get('token') if session else None
