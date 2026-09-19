import sys
import os
import tempfile
from pathlib import Path

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from backend.config.loader import load_global_config, save_global_config, load_project_config


class TestLoadGlobalConfig:
    def test_load_returns_defaults_when_missing(self, tmp_path):
        config_path = tmp_path / "nonexistent.json"
        config = load_global_config(str(config_path))

        assert config['auth'] == {}
        assert config['build'] == {'minify': True, 'outputDir': 'dist'}
        assert config['ai'] == {'provider': 'openai', 'model': 'gpt-4o'}

    def test_load_existing_config(self, tmp_path):
        config_path = tmp_path / "config.json"
        config_path.write_text('{"auth": {"github": {}}, "build": {"minify": false}, "ai": {"provider": "local"}}')

        config = load_global_config(str(config_path))

        assert config['auth'] == {"github": {}}
        assert config['build']['minify'] is False
        assert config['ai']['provider'] == 'local'

    def test_save_and_reload(self, tmp_path):
        config_path = tmp_path / "config.json"
        config = {
            'auth': {'ssh': {'token': 'abc'}},
            'build': {'minify': True},
            'ai': {'provider': 'openai'},
        }

        save_global_config(config, str(config_path))
        reloaded = load_global_config(str(config_path))

        assert reloaded == config

    def test_save_creates_directory(self, tmp_path):
        config_dir = tmp_path / "deep" / "nested"
        config_path = config_dir / "config.json"

        save_global_config({'auth': {}}, str(config_path))

        assert config_path.exists()


class TestLoadProjectConfig:
    def test_load_returns_defaults_when_missing(self, tmp_path):
        config_path = tmp_path / "nonexistent.json"
        config = load_project_config(str(config_path))

        assert config['name'] == 'untitled'
        assert config['template'] == 'default'
        assert config['build'] == {'input': 'src', 'output': 'dist'}
        assert config['deploy'] == {'target': 'local'}

    def test_load_existing_config(self, tmp_path):
        config_path = tmp_path / "website-builder.config.json"
        config_path.write_text('{"name": "my-site", "template": "blog", "build": {"input": "src", "output": "dist"}, "deploy": {"target": "github"}}')

        config = load_project_config(str(config_path))

        assert config['name'] == 'my-site'
        assert config['template'] == 'blog'
        assert config['deploy']['target'] == 'github'
