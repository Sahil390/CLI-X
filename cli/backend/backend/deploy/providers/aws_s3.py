import boto3
from typing import Dict, Any
from ..base import DeployProvider


class AwsS3Provider(DeployProvider):
    def supports(self, target: str) -> bool:
        return target == 'aws-s3'

    def deploy(self, source_dir: str, config: Dict[str, Any]) -> Dict[str, Any]:
        bucket = config.get('bucket', '')
        region = config.get('region', 'us-east-1')
        if not bucket:
            return {'success': False, 'message': 'No S3 bucket specified', 'error': 'Missing bucket'}
        try:
            s3 = boto3.client('s3', region_name=region)
            import os
            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    local_path = os.path.join(root, file)
                    relative_path = os.path.relpath(local_path, source_dir)
                    s3.upload_file(local_path, bucket, relative_path)
            url = f'https://{bucket}.s3.{region}.amazonaws.com'
            return {'success': True, 'message': 'Deployed to S3', 'url': url}
        except Exception as e:
            return {'success': False, 'message': str(e), 'error': str(e)}
