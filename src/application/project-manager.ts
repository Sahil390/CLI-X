import * as fs from 'fs';
import * as path from 'path';
import { FilesystemTool } from '../tools/filesystem';
import { DependencyManager } from '../project/dependency-manager';
import { ProjectMemory } from '../project/project-memory';
import { ChatHistory } from '../project/chat-history';
import { ProjectError } from '../utils/errors';

// ============================================================
// CLI-X — Project Manager (Application Layer)
// Handles project detection, creation, and scaffolding.
// ============================================================

export interface ProjectInfo {
  root: string;
  name: string;
  detectedFramework: string;
  language: 'typescript' | 'javascript';
  hasAiDir: boolean;
  hasGit: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export class ProjectManager {
  /**
   * Detects the project at the given directory.
   * Inspects package.json, framework, and .ai/ presence.
   */
  async detectProject(root: string): Promise<ProjectInfo> {
    if (!FilesystemTool.exists(path.join(root, 'package.json'))) {
      throw new ProjectError(`No package.json found in ${root}.`, 'PROJECT_NOT_FOUND');
    }

    const depManager = new DependencyManager(root);
    const framework = await depManager.detectFramework();

    const { detectPackageManager } = await import('../utils/helpers');
    const packageManager = detectPackageManager(root);

    const tsConfigExists =
      FilesystemTool.exists(path.join(root, 'tsconfig.json')) ||
      FilesystemTool.exists(path.join(root, 'tsconfig.base.json'));

    const hasAiDir = FilesystemTool.exists(path.join(root, '.ai'));
    const hasGit = FilesystemTool.exists(path.join(root, '.git'));
    const name = path.basename(root);

    return {
      root,
      name,
      detectedFramework: framework,
      language: tsConfigExists ? 'typescript' : 'javascript',
      hasAiDir,
      hasGit,
      packageManager,
    };
  }

  /**
   * Initializes the .ai/ memory structure for an existing project.
   */
  async initializeMemory(root: string, projectName: string): Promise<void> {
    const memory = new ProjectMemory(root);
    await memory.initialize();
    await memory.writeProject({
      name: projectName,
      updatedAt: new Date().toISOString(),
    });

    const chat = new ChatHistory(root);
    await chat.initialize();
  }

  /**
   * Scaffolds a brand-new project from a template.
   * Returns the new project root.
   */
  async scaffoldProject(
    name: string,
    template: 'react' | 'next' | 'vanilla',
    targetDir: string
  ): Promise<string> {
    const projectRoot = path.join(targetDir, name);

    if (FilesystemTool.exists(projectRoot)) {
      throw new ProjectError(`Directory "${projectRoot}" already exists.`, 'PROJECT_EXISTS');
    }

    const templateDir = path.join(__dirname, '..', '..', 'templates', template);
    if (!FilesystemTool.exists(templateDir)) {
      throw new ProjectError(
        `Template "${template}" not found at ${templateDir}.`,
        'TEMPLATE_NOT_FOUND'
      );
    }

    await FilesystemTool.copyDir(templateDir, projectRoot);
    await this.initializeMemory(projectRoot, name);

    return projectRoot;
  }
}
