import json
import sys
import os
import tempfile
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from backend.deploy.orchestrator import deploy_project


class TestDeployProject:
    def test_deploy_local_target_succeeds(self, tmp_path):
        source = tmp_path / "src"
        source.mkdir()
        (source / "index.html").write_text("<html></html>")

        project_config = {
            "build": {"output": str(source)},
            "deploy": {"target": "local", "local": {"path": str(tmp_path / "output")}},
        }

        result = deploy_project("local", project_config)

        assert result["success"] is True
        assert result["duration"] >= 0
        assert result["target"] == "local"

    def test_deploy_unknown_target_returns_failure(self, tmp_path):
        source = tmp_path / "src"
        source.mkdir()

        project_config = {
            "build": {"output": str(source)},
            "deploy": {"target": "unknown-provider"},
        }

        result = deploy_project("unknown-provider", project_config)

        assert result["success"] is False
        assert "Unknown deployment target" in result["message"]
        assert result["duration"] >= 0

    def test_deploy_returns_duration(self, tmp_path):
        source = tmp_path / "src"
        source.mkdir()
        (source / "index.html").write_text("<html></html>")

        project_config = {
            "build": {"output": str(source)},
            "deploy": {"target": "local", "local": {"path": str(tmp_path / "output")}},
        }

        result = deploy_project("local", project_config)

        assert "duration" in result
        assert isinstance(result["duration"], (int, float))
        assert result["duration"] >= 0

    def test_deploy_returns_target(self, tmp_path):
        source = tmp_path / "src"
        source.mkdir()

        project_config = {
            "build": {"output": str(source)},
            "deploy": {"target": "ssh"},
        }

        result = deploy_project("ssh", project_config)

        assert result["target"] == "ssh"

    def test_deploy_with_missing_source(self, tmp_path):
        project_config = {
            "build": {"output": "/nonexistent/source"},
            "deploy": {"target": "local", "local": {"path": str(tmp_path / "output")}},
        }

        result = deploy_project("local", project_config)

        # Local provider handles missing source gracefully
        assert result["target"] == "local"
