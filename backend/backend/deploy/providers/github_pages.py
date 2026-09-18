from typing import Dict, Any
from ..base import DeployProvider


class GitHubPagesProvider(DeployProvider):
    def supports(self, target: str) -> bool:
        return target == 'github'

    def deploy(self, source_dir: str, config: Dict[str, Any]) -> Dict[str, Any]:
        import subprocess
        import os

        owner = config.get('github', {}).get('owner', 'unknown')
        repo = config.get('github', {}).get('repo', 'unknown')

        token = os.getenv('GITHUB_TOKEN')
        if not token:
            return {'success': False, 'message': 'GITHUB_TOKEN not set', 'error': 'Missing token'}

        remote_url = f'https://{token}@github.com/{owner}/{repo}.git'

        try:
            subprocess.run(['git', 'init'], cwd=source_dir, capture_output=True)
            subprocess.run(['git', 'add', '.'], cwd=source_dir, capture_output=True)
            subprocess.run(['git', 'commit', '-m', 'deploy'], cwd=source_dir, capture_output=True)
            subprocess.run(['git', 'remote', 'add', 'origin', remote_url], cwd=source_dir, capture_output=True)
            subprocess.run(['git', 'push', '-f', 'origin', 'main'], cwd=source_dir, capture_output=True)
            return {'success': True, 'message': 'Deployed to GitHub Pages', 'url': f'https://{owner}.github.io/{repo}'}
        except Exception as e:
            return {'success': False, 'message': str(e), 'error': str(e)}
