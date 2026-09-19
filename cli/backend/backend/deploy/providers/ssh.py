import subprocess
from typing import Dict, Any
from ..base import DeployProvider


class SSHProvider(DeployProvider):
    def supports(self, target: str) -> bool:
        return target == 'ssh'

    def deploy(self, source_dir: str, config: Dict[str, Any]) -> Dict[str, Any]:
        ssh_config = config.get('ssh', {})
        host = ssh_config.get('host', 'localhost')
        user = ssh_config.get('user', 'root')
        remote_path = ssh_config.get('path', '/var/www/html')
        port = ssh_config.get('port', 22)

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
