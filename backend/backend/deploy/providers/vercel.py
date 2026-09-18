import subprocess
from typing import Dict, Any
from ..base import DeployProvider


class VercelProvider(DeployProvider):
    def supports(self, target: str) -> bool:
        return target == 'vercel'

    def deploy(self, source_dir: str, config: Dict[str, Any]) -> Dict[str, Any]:
        token = config.get('token', '')
        team_id = config.get('team_id', '')
        if not token:
            return {'success': False, 'message': 'No Vercel token provided', 'error': 'Missing token'}
        try:
            cmd = ['npx', 'vercel', '--prod', '--token', token]
            if team_id:
                cmd.extend(['--scope', team_id])
            result = subprocess.run(cmd, cwd=source_dir, capture_output=True, text=True)
            if result.returncode != 0:
                return {'success': False, 'message': result.stderr, 'error': result.stderr}
            return {'success': True, 'message': 'Deployed to Vercel', 'url': result.stdout.strip()}
        except FileNotFoundError:
            return {'success': False, 'message': 'Vercel CLI not found', 'error': 'Install Vercel CLI'}
