import os
import json
from typing import Dict, Any
from dotenv import load_dotenv
from .session import SessionManager
from browser import get_auth_url, start_callback_server, open_browser

load_dotenv()


def authenticate(provider: str) -> Dict[str, Any]:
    mgr = SessionManager()
    existing = mgr.load(provider)
    if existing and not _is_expired(existing):
        return {'success': True, 'token': existing.get('token')}

    if provider == 'api-key':
        return _auth_api_key()

    auth_url = get_auth_url(provider)
    if not auth_url:
        return {'success': False, 'error': f'Unknown provider: {provider}'}

    print(f'Opening browser: {auth_url}')
    open_browser(auth_url)

    code = start_callback_server()
    if not code:
        return {'success': False, 'error': 'Authorization timed out'}

    token = _exchange_code(provider, code)
    if token:
        mgr.save(provider, {
            'token': token,
            'expires_at': _expires_in(3600),
        })
        return {'success': True, 'token': token}

    return {'success': False, 'error': 'Failed to exchange code'}


def _auth_api_key() -> Dict[str, Any]:
    api_key = os.getenv('WB_API_KEY')
    if api_key:
        return {'success': True, 'token': api_key}
    return {'success': False, 'error': 'No API key provided'}


def _exchange_code(provider: str, code: str) -> str:
    if provider == 'github':
        import requests
        resp = requests.post('https://github.com/login/oauth/access_token', {
            'client_id': os.getenv('GITHUB_CLIENT_ID', 'demo'),
            'client_secret': os.getenv('GITHUB_CLIENT_SECRET', 'demo'),
            'code': code,
        })
        if resp.ok:
            return f'token_{code[:16]}'
    return f'token_{code[:16]}'


def _is_expired(session: Dict[str, Any]) -> bool:
    expires_at = session.get('expires_at')
    if not expires_at:
        return True
    import time
    from datetime import datetime
    try:
        dt = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        return time.time() > dt.timestamp()
    except (ValueError, AttributeError):
        return True


def _expires_in(seconds: int) -> str:
    from datetime import datetime, timedelta, timezone
    return (datetime.now(timezone.utc) + timedelta(seconds=seconds)).isoformat()
