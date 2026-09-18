from pathlib import Path
from typing import Dict, Any, List
from abc import ABC, abstractmethod
import json
import os
import shutil


class DeployProvider(ABC):
    @abstractmethod
    def deploy(self, source_dir: str, config: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def supports(self, target: str) -> bool:
        pass


class LocalProvider(DeployProvider):
    def supports(self, target: str) -> bool:
        return target == 'local'

    def deploy(self, source_dir: str, config: Dict[str, Any]) -> Dict[str, Any]:
        dest = config.get('path', './dist')
        dest_path = Path(dest)
        dest_path.mkdir(parents=True, exist_ok=True)

        source_path = Path(source_dir)
        if source_path.exists():
            for item in source_path.iterdir():
                dst = dest_path / item.name
                if item.is_dir():
                    shutil.copytree(item, dst, dirs_exist_ok=True)
                else:
                    shutil.copy2(item, dst)

        return {
            'success': True,
            'message': f'Deployed {source_dir} to {dest}',
            'url': dest,
        }


class SSHProvider(DeployProvider):
    def supports(self, target: str) -> bool:
        return target == 'ssh'

    def deploy(self, source_dir: str, config: Dict[str, Any]) -> Dict[str, Any]:
        ssh_config = config.get('ssh', {})
        host = ssh_config.get('host', 'localhost')
        user = ssh_config.get('user', 'root')
        remote_path = ssh_config.get('path', '/var/www/html')
        port = ssh_config.get('port', 22)

        import subprocess
        try:
            cmd = [
                'rsync', '-avz', '--delete',
                '-e', f'ssh -p {port}',
                f'{source_dir}/',
                f'{user}@{host}:{remote_path}/',
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                return {'success': False, 'message': result.stderr, 'error': result.stderr}
            return {'success': True, 'message': 'Deployed via SSH/rsync', 'url': f'ssh://{user}@{host}/{remote_path}'}
        except FileNotFoundError:
            return {'success': False, 'message': 'rsync not found. Install rsync.', 'error': 'rsync not found'}


class GitHubPagesProvider(DeployProvider):
    def supports(self, target: str) -> bool:
        return target == 'github'

    def deploy(self, source_dir: str, config: Dict[str, Any]) -> Dict[str, Any]:
        gh_config = config.get('github', {})
        owner = gh_config.get('owner', 'unknown')
        repo = gh_config.get('repo', 'unknown')

        import subprocess
        token = os.getenv('GITHUB_TOKEN')
        if not token:
            return {'success': False, 'message': 'GITHUB_TOKEN not set', 'error': 'Missing token'}

        try:
            import requests
            api_url = f'https://api.github.com/repos/{owner}/{repo}/pages'
            headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}
            resp = requests.get(api_url, headers=headers)

            remote_url = f'https://github.com/{owner}/{repo}.git'
            cmd = ['git', 'init', source_dir]
            subprocess.run(cmd, cwd=source_dir, capture_output=True)
            subprocess.run(['git', 'add', '.'], cwd=source_dir, capture_output=True)
            subprocess.run(['git', 'commit', '-m', 'deploy'], cwd=source_dir, capture_output=True)
            subprocess.run(['git', 'remote', 'add', 'origin', remote_url], cwd=source_dir, capture_output=True)
            subprocess.run(['git', 'push', '-f', 'origin', 'main'], cwd=source_dir, capture_output=True)

            return {'success': True, 'message': 'Deployed to GitHub Pages', 'url': f'https://{owner}.github.io/{repo}'}
        except Exception as e:
            return {'success': False, 'message': str(e), 'error': str(e)}


PROVIDERS = [LocalProvider(), SSHProvider(), GitHubPagesProvider()]


def get_provider(target: str) -> DeployProvider:
    for p in PROVIDERS:
        if p.supports(target):
            return p
    raise ValueError(f'Unknown deployment target: {target}')
