import shutil
from pathlib import Path
from typing import Dict, Any


class LocalProvider:
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

        return {'success': True, 'message': f'Deployed to {dest}', 'url': str(dest)}
