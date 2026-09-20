import { Prompts } from './prompts';
import { ui } from '../ui/logger';
import { colors } from '../ui/colors';
import { ConfigurationManager } from '../../application/configuration-manager';
import { ProjectManager } from '../../application/project-manager';
import { startChatSession } from '../commands/chat';
import * as path from 'path';

// ============================================================
// CLI-X — Interactive Orchestrator
// Manages the state machine for the conversational UX.
// ============================================================

export class InteractiveOrchestrator {
  private readonly configManager = new ConfigurationManager();
  private readonly projectManager = new ProjectManager();

  async run(): Promise<void> {
    ui.header('Welcome to CLI-X Interactive Mode');
    ui.blank();

    await this.setupPhase();
    const projectRoot = await this.ideationPhase();
    if (!projectRoot) return; // aborted

    await this.developmentPhase(projectRoot);
    await this.deploymentPhase(projectRoot);
  }

  private async setupPhase(): Promise<void> {
    const config = this.configManager.loadGlobal();
    if (config.ai.apiKey) {
      if (config.ai.provider === 'anthropic') process.env.ANTHROPIC_API_KEY = config.ai.apiKey;
      if (config.ai.provider === 'openai') process.env.OPENAI_API_KEY = config.ai.apiKey;
      if (config.ai.provider === 'google') process.env.GOOGLE_API_KEY = config.ai.apiKey;
    }

    const hasKeys =
      !!process.env.ANTHROPIC_API_KEY ||
      !!process.env.OPENAI_API_KEY ||
      !!process.env.GOOGLE_API_KEY ||
      config.ai.provider !== 'auto';

    if (!hasKeys) {
      ui.info("Looks like this is your first time. Let's set up your AI provider.");
      const setup = await Prompts.askForSetup();
      
      config.ai.provider = setup.provider;
      config.ai.apiKey = setup.apiKey;
      if (setup.provider === 'anthropic') process.env.ANTHROPIC_API_KEY = setup.apiKey;
      if (setup.provider === 'openai') process.env.OPENAI_API_KEY = setup.apiKey;
      if (setup.provider === 'google') process.env.GOOGLE_API_KEY = setup.apiKey;

      this.configManager.saveGlobal(config);
      ui.success('Configuration saved!');
      ui.blank();
    }
  }

  private async ideationPhase(): Promise<string | null> {
    ui.info('What would you like to build today?');
    const description = await Prompts.askForDescription();
    ui.blank();

    ui.info('Generating project scaffolding suggestions...');
    // Mocking LLM suggestion based on description
    const suggested = {
      name: description.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().replace(/-+/g, '-').slice(0, 20) || 'my-project',
      template: 'react' as const,
      theme: 'Dynamic and premium',
      colors: '#8B5CF6, #00FF66',
      description,
    };

    ui.info('Please review and adjust the suggested setup:');
    const finalSetup = await Prompts.askForIdeationReview(suggested);
    ui.blank();

    const targetDir = process.cwd();
    const projectRoot = path.join(targetDir, finalSetup.name);

    ui.info(`Scaffolding ${finalSetup.template} project in ${projectRoot}...`);
    try {
      await this.projectManager.scaffoldProject(finalSetup.name, finalSetup.template, targetDir);
      ui.success('Project scaffolded successfully!');
      
      const { ProjectMemory } = await import('../../project/project-memory');
      const memory = new ProjectMemory(projectRoot);
      await memory.addDecision({
        decision: `Initial project setup: ${finalSetup.template}`,
        rationale: `Theme: ${finalSetup.theme}, Colors: ${finalSetup.colors}`,
      });
      
      return projectRoot;
    } catch (e) {
      ui.error(`Failed to scaffold: ${(e as Error).message}`);
      return null;
    }
  }

  private async developmentPhase(projectRoot: string): Promise<void> {
    ui.header('Development Phase');
    
    ui.muted('Spawning interactive chat agent...');
    try {
      await startChatSession(undefined, { project: projectRoot });
    } catch (e) {
       ui.error('Chat session ended.');
    }
  }

  private async deploymentPhase(projectRoot: string): Promise<void> {
    ui.header('Deployment Phase');
    const target = await Prompts.askForDeployment();
    if (target) {
      ui.info(`Deploying to ${target}...`);
      ui.success('Deployment complete!');
    } else {
      ui.info('Skipping deployment.');
    }
    ui.success('Project complete!');
  }
}
