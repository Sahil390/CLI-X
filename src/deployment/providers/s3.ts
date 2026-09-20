import { NotImplementedError } from '../../utils/errors';

// ============================================================
// CLI-X — AWS S3 / CloudFront Deployment Provider Stub
// Architecture boundary defined. Deferred to Step 5.
// ============================================================

export interface S3Config {
  bucket: string;
  region: string;
  distributionId?: string; // CloudFront distribution ID
  prefix?: string;         // Key prefix in bucket
  acl?: 'private' | 'public-read';
}

export interface S3SyncResult {
  filesUploaded: number;
  filesDeleted: number;
  bytesTransferred: number;
  url: string;
}

const DEFAULT_CONFIG: Partial<S3Config> = {
  region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
  acl: 'public-read',
  prefix: '',
};

export class S3Provider {
  readonly config: S3Config;

  constructor(config: S3Config) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Syncs the build directory to the configured S3 bucket.
   * Step 5: Wire @aws-sdk/client-s3 PutObjectCommand with recursive walk.
   */
  async sync(_buildDir: string): Promise<S3SyncResult> {
    throw new NotImplementedError('S3 bucket sync');
  }

  /**
   * Invalidates the CloudFront cache for the configured distribution.
   * Step 5: Wire @aws-sdk/client-cloudfront CreateInvalidationCommand.
   */
  async invalidateCache(paths: string[] = ['/*']): Promise<void> {
    throw new NotImplementedError('CloudFront cache invalidation');
  }

  /** Returns the S3 static website URL. */
  websiteUrl(): string {
    return `http://${this.config.bucket}.s3-website-${this.config.region}.amazonaws.com`;
  }

  /** Returns the S3 console URL for this bucket. */
  consoleUrl(): string {
    return `https://s3.console.aws.amazon.com/s3/buckets/${this.config.bucket}`;
  }
}
