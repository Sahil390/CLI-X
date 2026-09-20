import * as fs from 'fs';
import * as path from 'path';
import { FilesystemTool } from './filesystem';

// ============================================================
// CLI-X — Project State Tool
// Low-level helpers for reading/writing .ai/ state files.
// ============================================================

export const AI_DIR = '.ai';

export type AiStateFile =
  | 'project.json'
  | 'architecture.json'
  | 'design.json'
  | 'decisions.json'
  | 'history.json';

export const ProjectStateTool = {
  /** Returns the .ai/ directory path for a given project root. */
  aiDir(projectRoot: string): string {
    return path.join(projectRoot, AI_DIR);
  },

  /** Returns the full path to a specific .ai/ state file. */
  statePath(projectRoot: string, file: AiStateFile): string {
    return path.join(projectRoot, AI_DIR, file);
  },

  /** Ensures the .ai/ directory and all state files exist. */
  async initialize(projectRoot: string): Promise<void> {
    const aiDir = ProjectStateTool.aiDir(projectRoot);
    await FilesystemTool.makeDir(aiDir);
    await FilesystemTool.makeDir(path.join(aiDir, 'chat'));

    const defaults: Record<AiStateFile, unknown> = {
      'project.json': { name: path.basename(projectRoot), createdAt: new Date().toISOString() },
      'architecture.json': { layers: [], dependencies: [] },
      'design.json': { theme: 'dark', colorScheme: 'auto', typography: 'system' },
      'decisions.json': { decisions: [] },
      'history.json': { events: [] },
    };

    for (const [file, defaultValue] of Object.entries(defaults)) {
      const filePath = ProjectStateTool.statePath(projectRoot, file as AiStateFile);
      if (!FilesystemTool.exists(filePath)) {
        await FilesystemTool.writeJson(filePath, defaultValue);
      }
    }
  },

  /** Reads a .ai/ state file, returning null if it doesn't exist. */
  async read<T = unknown>(projectRoot: string, file: AiStateFile): Promise<T | null> {
    const filePath = ProjectStateTool.statePath(projectRoot, file);
    if (!FilesystemTool.exists(filePath)) return null;
    return FilesystemTool.readJson<T>(filePath);
  },

  /** Writes a value to a .ai/ state file. */
  async write(projectRoot: string, file: AiStateFile, data: unknown): Promise<void> {
    await FilesystemTool.writeJson(
      ProjectStateTool.statePath(projectRoot, file),
      data
    );
  },

  /** Merges new data into an existing .ai/ state file. */
  async merge(
    projectRoot: string,
    file: AiStateFile,
    updates: Record<string, unknown>
  ): Promise<void> {
    const existing = (await ProjectStateTool.read<Record<string, unknown>>(projectRoot, file)) ?? {};
    await ProjectStateTool.write(projectRoot, file, { ...existing, ...updates });
  },
};
