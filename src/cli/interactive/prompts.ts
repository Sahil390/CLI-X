import inquirer from 'inquirer';

// ============================================================
// CLI-X — Interactive Prompts
// Uses inquirer to prompt the user during onboarding/ideation.
// ============================================================

export interface SetupChoices {
  provider: string;
  apiKey: string;
}

export interface IdeationChoices {
  name: string;
  template: 'react' | 'next' | 'vanilla';
  theme: string;
  colors: string;
  description: string;
}

export const Prompts = {
  /** Prompts for AI Provider and API Key */
  async askForSetup(): Promise<SetupChoices> {
    const { provider } = await inquirer.prompt<{ provider: string }>([
      {
        type: 'list',
        name: 'provider',
        message: 'Select your preferred AI provider:',
        choices: [
          { name: 'Anthropic (Claude 3.5 Sonnet)', value: 'anthropic' },
          { name: 'OpenAI (GPT-4o)', value: 'openai' },
          { name: 'Google Gemini', value: 'google' },
          { name: 'AWS Bedrock', value: 'bedrock' },
        ],
      },
    ]);

    const { apiKey } = await inquirer.prompt<{ apiKey: string }>([
      {
        type: 'password',
        name: 'apiKey',
        message: `Enter your ${provider} API Key:`,
        mask: '*',
      },
    ]);

    return { provider, apiKey };
  },

  /** Prompts for initial project description */
  async askForDescription(): Promise<string> {
    const { description } = await inquirer.prompt<{ description: string }>([
      {
        type: 'input',
        name: 'description',
        message: 'Describe the website you want to build:',
      },
    ]);
    return description;
  },

  /** Prompts to review and edit project ideation */
  async askForIdeationReview(suggested: Partial<IdeationChoices>): Promise<IdeationChoices> {
    const answers = await inquirer.prompt<IdeationChoices>([
      {
        type: 'input',
        name: 'name',
        message: 'Project Name:',
        default: suggested.name ?? 'my-website',
      },
      {
        type: 'list',
        name: 'template',
        message: 'Tech Stack / Template:',
        choices: ['react', 'next', 'vanilla'],
        default: suggested.template ?? 'react',
      },
      {
        type: 'input',
        name: 'theme',
        message: 'Theme/Vibe:',
        default: suggested.theme ?? 'Modern and minimal',
      },
      {
        type: 'input',
        name: 'colors',
        message: 'Color Palette:',
        default: suggested.colors ?? '#ffffff, #000000',
      },
    ]);

    return { ...answers, description: suggested.description ?? '' };
  },

  /** Ask for deployment confirmation */
  async askForDeployment(): Promise<string | null> {
    const { deploy } = await inquirer.prompt<{ deploy: boolean }>([
      {
        type: 'confirm',
        name: 'deploy',
        message: 'Would you like to deploy this project now?',
        default: false,
      },
    ]);

    if (!deploy) return null;

    const { target } = await inquirer.prompt<{ target: string }>([
      {
        type: 'list',
        name: 'target',
        message: 'Select a deployment target:',
        choices: ['local', 'vercel', 'amplify', 's3'],
      },
    ]);

    return target;
  }
};
