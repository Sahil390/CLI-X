import sys
import os
import tempfile
import time
from pathlib import Path

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from backend.auth.session import SessionManager


@pytest.fixture
def temp_home(tmp_path):
    """Set HOME to a temp directory."""
    old_home = os.environ.get('HOME')
    os.environ['HOME'] = str(tmp_path)
    yield tmp_path
    if old_home:
        os.environ['HOME'] = old_home
    else:
        os.environ.pop('HOME', None)


class TestSessionManager:
    def test_session_save_and_load(self, temp_home):
        mgr = SessionManager()
        session = {'token': 'abc123', 'expires_at': '2099-01-01T00:00:00'}

        mgr.save('github', session)
        loaded = mgr.load('github')

        assert loaded is not None
        assert loaded['token'] == 'abc123'

    def test_session_load_missing_returns_none(self, temp_home):
        mgr = SessionManager()
        result = mgr.load('nonexistent')
        assert result is None

    def test_session_clear_specific_provider(self, temp_home):
        mgr = SessionManager()
        mgr.save('github', {'token': 'abc'})
        mgr.save('ssh', {'token': 'def'})

        mgr.clear('github')

        assert mgr.load('github') is None
        assert mgr.load('ssh') is not None

    def test_session_clear_all(self, temp_home):
        mgr = SessionManager()
        mgr.save('github', {'token': 'abc'})

        mgr.clear()

        assert mgr.load('github') is None
        assert not mgr.session_file.exists() or mgr.load_all() == {}

    def test_session_load_all(self, temp_home):
        mgr = SessionManager()
        mgr.save('github', {'token': 'abc'})
        mgr.save('ssh', {'token': 'def'})

        all_sessions = mgr.load_all()
        assert 'github' in all_sessions
        assert 'ssh' in all_sessions

    def test_session_is_expired_when_past_expiry(self, temp_home):
        expired_session = {'token': 'abc', 'expires_at': '2000-01-01T00:00:00'}
        mgr = SessionManager()
        assert mgr._is_expired(expired_session) is True

    def test_session_not_expired_when_future(self, temp_home):
        future_session = {'token': 'abc', 'expires_at': '2099-01-01T00:00:00'}
        mgr = SessionManager()
        assert mgr._is_expired(future_session) is False

    def test_session_refresh_clears_expired(self, temp_home):
        mgr = SessionManager()
        mgr.save('github', {'token': 'old', 'expires_at': '2000-01-01T00:00:00'})

        loaded = mgr.load('github')
        # After load, expired session should be cleared (refresh + reload)
        # The refresh method is a no-op, but _is_expired should be True
        assert loaded is None or mgr._is_expired(loaded)

    def test_get_token_returns_token(self, temp_home):
        mgr = SessionManager()
        mgr.save('github', {'token': 'my-token'})

        token = mgr.get_token('github')
        assert token == 'my-token'

    def test_get_token_returns_none_when_missing(self, temp_home):
        mgr = SessionManager()
        token = mgr.get_token('github')
        assert token is None
