import sys
import os
import json
import tempfile
from click.testing import CliRunner

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

import backend.cli as cli_module


class TestBackendCLI:
    @pytest.fixture(autouse=True)
    def runner(self):
        return CliRunner()

    def test_build_command(self, tmp_path, runner):
        src = tmp_path / "src"
        src.mkdir()
        (src / "index.html").write_text("<html></html>")
        output = tmp_path / "dist"

        result = runner.invoke(
            cli_module.cli,
            ['build', '--input', str(src), '--output', str(output)],
            catch_exceptions=False,
        )

        assert result.exit_code == 0
        output_json = json.loads(result.output.strip())
        assert output_json['files'] == 1
        assert output_json['outputDir'] == str(output)
        assert 'duration' in output_json

    def test_build_missing_input(self, tmp_path, runner):
        output = tmp_path / "dist"

        result = runner.invoke(
            cli_module.cli,
            ['build', '--input', '/nonexistent', '--output', str(output)],
            catch_exceptions=False,
        )

        assert result.exit_code == 0
        output_json = json.loads(result.output.strip())
        assert output_json['files'] == 0
        assert len(output_json['errors']) > 0

    def test_deploy_local_target(self, tmp_path, runner):
        src = tmp_path / "dist"
        src.mkdir()
        (src / "index.html").write_text("<html></html>")
        project_config = tmp_path / "config.json"
        project_config.write_text(json.dumps({
            "name": "test",
            "build": {"output": str(src)},
            "deploy": {"target": "local", "local": {"path": str(tmp_path / "output")}},
        }))

        result = runner.invoke(
            cli_module.cli,
            ['deploy', '--target', 'local', '--config', str(project_config)],
            catch_exceptions=False,
        )

        assert result.exit_code == 0
        assert 'Deployed' in result.output or 'deployed' in result.output.lower()

    def test_deploy_unknown_target(self, tmp_path, runner):
        src = tmp_path / "dist"
        src.mkdir()
        project_config = tmp_path / "config.json"
        project_config.write_text(json.dumps({
            "name": "test",
            "build": {"output": str(src)},
            "deploy": {"target": "unknown"},
        }))

        result = runner.invoke(
            cli_module.cli,
            ['deploy', '--target', 'unknown', '--config', str(project_config)],
            catch_exceptions=False,
        )

        assert result.exit_code != 0

    def test_ai_command(self, runner, tmp_path):
        output_dir = tempfile.mkdtemp()
        result = runner.invoke(
            cli_module.cli,
            ['ai', '--prompt', 'a hello world page', '--output', output_dir],
            catch_exceptions=False,
        )

        assert result.exit_code == 0
        output_json = json.loads(result.output.strip())
        assert 'html' in output_json
        assert 'css' in output_json
        assert 'js' in output_json

    def test_login_api_key(self, runner, monkeypatch):
        monkeypatch.setenv('WB_API_KEY', 'test-api-key')

        result = runner.invoke(
            cli_module.cli,
            ['login', '--provider', 'api-key'],
            catch_exceptions=False,
        )

        assert result.exit_code == 0
        assert 'Login successful' in result.output or 'successful' in result.output.lower()

    def test_login_unknown_provider(self, runner):
        result = runner.invoke(
            cli_module.cli,
            ['login', '--provider', 'unknown'],
            catch_exceptions=False,
        )

        assert result.exit_code != 0

    def test_login_github_no_env(self, runner):
        result = runner.invoke(
            cli_module.cli,
            ['login', '--provider', 'github'],
            catch_exceptions=False,
        )

        assert result.exit_code is not None
