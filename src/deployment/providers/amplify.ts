import { NotImplementedError } from '../../utils/errors';

// ============================================================
// CLI-X — AWS Amplify Deployment Provider Stub
// Architecture boundary defined. Deferred to Step 5.
// ============================================================

export interface AmplifyConfig {
  appId: string;
  branch: string;
  region: string;
  buildSpec?: string;
}

export interface AmplifyDeployResult {
  deploymentId: string;
  status: 'PENDING' | 'PROVISIONING' | 'DEPLOYING' | 'SUCCEED' | 'FAILED';
  url?: string;
}

const DEFAULT_CONFIG: Partial<AmplifyConfig> = {
  branch: 'main',
  region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
};

export class AmplifyProvider {
  readonly config: AmplifyConfig;

  constructor(config: AmplifyConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Deploys the build directory to AWS Amplify.
   * Step 5: Wire @aws-sdk/client-amplify and startDeployment().
   */
  async deploy(_buildDir: string): Promise<AmplifyDeployResult> {
    throw new NotImplementedError('AWS Amplify deployment');
  }

  /**
   * Retrieves the current deployment status.
   * Step 5: Wire getJob() API call.
   */
  async getStatus(_deploymentId: string): Promise<AmplifyDeployResult> {
    throw new NotImplementedError('AWS Amplify getStatus');
  }

  /**
   * Returns the live app URL for the configured branch.
   * Step 5: Wire getApp() → customDomains || defaultDomain.
   */
  async getUrl(): Promise<string> {
    throw new NotImplementedError('AWS Amplify getUrl');
  }

  /** Returns the expected Amplify Console URL for this app. */
  consoleUrl(): string {
    return `https://${this.config.region}.console.aws.amazon.com/amplify/home#/apps/${this.config.appId}`;
  }

  /** Lists supported AWS regions for Amplify. */
  static supportedRegions(): string[] {
    return [
      'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
      'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1',
    ];
  }
}
