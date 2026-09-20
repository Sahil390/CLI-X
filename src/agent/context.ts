import { ProjectMemory } from '../project/project-memory';
import { DependencyManager } from '../project/dependency-manager';
import { FilesystemTool } from '../tools/filesystem';
import * as path from 'path';

// ============================================================
// CLI-X — Context Assembly
// Gathers project state and assembles a context object
// for agent prompts.
// ============================================================

export interface AgentContext {
  projectRoot: string;
  projectName: string;
  framework: string;
  language: string;
  recentFiles: string[];
  openIssues: string[];
  sessionSummary: string;
}

export class ContextAssembler {
  constructor(private readonly projectRoot: string) {}

  /** Assembles the current agent context from project state. */
  async assemble(): Promise<AgentContext> {
    const memory = new ProjectMemory(this.projectRoot);
    const projectState = await memory.readProject();
    const depManager = new DependencyManager(this.projectRoot);
    const framework = await depManager.detectFramework();

    // Gather recent source files (top-level src/ or root)
    const recentFiles = await this.gatherSourceFiles();

    return {
      projectRoot: this.projectRoot,
      projectName: projectState?.name ?? path.basename(this.projectRoot),
      framework,
      language: projectState?.language ?? 'typescript',
      recentFiles,
      openIssues: [],
      sessionSummary: `Project: ${projectState?.name ?? 'unknown'}, Framework: ${framework}`,
    };
  }

  /** Returns up to 20 source file paths in the project. */
  private async gatherSourceFiles(): Promise<string[]> {
    const candidates = ['src', 'app', 'pages', 'components', '.'];
    for (const dir of candidates) {
      const dirPath = path.join(this.projectRoot, dir);
      if (FilesystemTool.exists(dirPath)) {
        try {
          const entries = await FilesystemTool.listDir(dirPath);
          return entries
            .filter((e) => !e.isDirectory)
            .slice(0, 20)
            .map((e) => e.path);
        } catch {
          continue;
        }
      }
    }
    return [];
  }
}
