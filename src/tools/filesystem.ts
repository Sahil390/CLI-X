import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { ToolError } from '../utils/errors';

// ============================================================
// CLI-X — Filesystem Tool
// Safe wrappers around Node.js fs operations.
// ============================================================

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  sizeBytes?: number;
}

export const FilesystemTool = {
  /**
   * Reads a file as UTF-8 text.
   */
  async readFile(filePath: string): Promise<string> {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      throw new ToolError(`Failed to read file at ${filePath}: ${(e as Error).message}`);
    }
  },

  /**
   * Writes content to a file, creating parent directories as needed.
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (e) {
      throw new ToolError(`Failed to write file at ${filePath}: ${(e as Error).message}`);
    }
  },

  /**
   * Appends content to a file.
   */
  async appendFile(filePath: string, content: string): Promise<void> {
    try {
      fs.appendFileSync(filePath, content, 'utf-8');
    } catch (e) {
      throw new ToolError(`Failed to append to file at ${filePath}: ${(e as Error).message}`);
    }
  },

  /**
   * Deletes a file if it exists.
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      throw new ToolError(`Failed to delete file at ${filePath}: ${(e as Error).message}`);
    }
  },

  /**
   * Checks whether a path exists (file or directory).
   */
  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  },

  /**
   * Creates a directory (and any parent dirs) if it doesn't exist.
   */
  async makeDir(dirPath: string): Promise<void> {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (e) {
      throw new ToolError(`Failed to create directory at ${dirPath}: ${(e as Error).message}`);
    }
  },

  /**
   * Lists the immediate children of a directory.
   */
  async listDir(dirPath: string): Promise<FileEntry[]> {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      return entries.map((entry) => {
        const entryPath = path.join(dirPath, entry.name);
        const isDirectory = entry.isDirectory();
        const sizeBytes = isDirectory
          ? undefined
          : fs.statSync(entryPath).size;
        return { name: entry.name, path: entryPath, isDirectory, sizeBytes };
      });
    } catch (e) {
      throw new ToolError(`Failed to list directory at ${dirPath}: ${(e as Error).message}`);
    }
  },

  /**
   * Copies a directory recursively to a new location.
   */
  async copyDir(src: string, dest: string): Promise<void> {
    try {
      await fse.copy(src, dest, { overwrite: true });
    } catch (e) {
      throw new ToolError(`Failed to copy ${src} → ${dest}: ${(e as Error).message}`);
    }
  },

  /**
   * Moves a file or directory.
   */
  async moveFile(src: string, dest: string): Promise<void> {
    try {
      await fse.move(src, dest, { overwrite: true });
    } catch (e) {
      throw new ToolError(`Failed to move ${src} → ${dest}: ${(e as Error).message}`);
    }
  },

  /**
   * Reads a JSON file and parses it.
   */
  async readJson<T = unknown>(filePath: string): Promise<T> {
    const raw = await FilesystemTool.readFile(filePath);
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      throw new ToolError(`Failed to parse JSON at ${filePath}: ${(e as Error).message}`);
    }
  },

  /**
   * Writes a JSON object to a file with pretty formatting.
   */
  async writeJson(filePath: string, data: unknown): Promise<void> {
    await FilesystemTool.writeFile(filePath, JSON.stringify(data, null, 2));
  },

  /**
   * Removes a directory and all its contents recursively.
   */
  async removeDir(dirPath: string): Promise<void> {
    try {
      await fse.remove(dirPath);
    } catch (e) {
      throw new ToolError(`Failed to remove directory ${dirPath}: ${(e as Error).message}`);
    }
  },
};
