from ..providers.base import get_provider
from typing import Dict, Any
import json
import time


def deploy_project(target: str, project_config: Dict[str, Any]) -> Dict[str, Any]:
    source_dir = project_config.get('build', {}).get('output', 'dist')
    config = project_config.get('deploy', {})

    try:
        provider = get_provider(target)
    except ValueError as e:
        return {'success': False, 'message': str(e), 'duration': 0}

    start = time.time()
    result = provider.deploy(source_dir, config)
    elapsed = time.time() - start

    return {
        **result,
        'duration': round(elapsed * 1000),
        'target': target,
    }
