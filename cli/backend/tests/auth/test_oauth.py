import sys
import os
import tempfile
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))


class TestAuthenticate:
    def test_api_key_provider_with_env_var(self):
        os.environ['WB_API_KEY'] = 'test-api-key-123'
        try:
            from backend.auth.oauth import authenticate
            result = authenticate('api-key')
            assert result['success'] is True
            assert result['token'] == 'test-api-key-123'
        finally:
            os.environ.pop('WB_API_KEY', None)

    def test_api_key_provider_without_env_var(self):
        if 'WB_API_KEY' in os.environ:
            del os.environ['WB_API_KEY']

        from backend.auth.oauth import authenticate
        result = authenticate('api-key')
        assert result['success'] is False
        assert 'No API key' in result.get('error', '')

    def test_unknown_provider_returns_failure(self):
        from backend.auth.oauth import authenticate
        result = authenticate('unknown-provider')
        assert result['success'] is False
        assert 'Unknown provider' in result.get('error', '')

    def test_github_provider_triggers_oauth_flow(self):
        with patch('backend.auth.oauth.get_auth_url') as mock_get_url, \
             patch('backend.auth.oauth.open_browser') as mock_open_browser, \
             patch('backend.auth.oauth.start_callback_server') as mock_callback, \
             patch('backend.auth.oauth._exchange_code') as mock_exchange:

            mock_get_url.return_value = 'https://github.com/login/oauth/authorize?client_id=test'
            mock_callback.return_value = 'auth-code-123'
            mock_exchange.return_value = 'token-abc'

            from backend.auth.oauth import authenticate
            result = authenticate('github')

            assert mock_get_url.called
            assert mock_open_browser.called
            assert result['success'] is True

    def test_github_provider_exchange_code(self):
        with patch('backend.auth.oauth._exchange_code', return_value='token-xyz'), \
             patch('backend.auth.oauth.get_auth_url', return_value='https://test'), \
             patch('backend.auth.oauth.open_browser'), \
             patch('backend.auth.oauth.start_callback_server', return_value='code'):

            from backend.auth.oauth import authenticate
            result = authenticate('github')

            assert result['success'] is True
