import * as fs from 'fs';
import * as path from 'path';
import { PackageManagerTool } from '../tools/package-manager';
import { FilesystemTool } from '../tools/filesystem';
import { ToolError } from '../utils/errors';

// ============================================================
// CLI-X — Dependency Manager
// Manages package.json inspection and dependency installation
// for generated/scaffolded project directories.
// ============================================================

export interface PackageInfo {
  name: string;
  version: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export class DependencyManager {
  constructor(private readonly projectRoot: string) {}

  /** Reads and parses package.json from the project root. */
  async readPackageJson(): Promise<PackageInfo> {
    const pkgPath = path.join(this.projectRoot, 'package.json');
    if (!FilesystemTool.exists(pkgPath)) {
      throw new ToolError(`No package.json found in ${this.projectRoot}`);
    }
    const raw = await FilesystemTool.readFile(pkgPath);
    const pkg = JSON.parse(raw);
    return {
      name: pkg.name ?? 'unknown',
      version: pkg.version ?? '0.0.0',
      scripts: pkg.scripts ?? {},
      dependencies: pkg.dependencies ?? {},
      devDependencies: pkg.devDependencies ?? {},
    };
  }

  /** Detects the JavaScript framework from package.json dependencies. */
  async detectFramework(): Promise<string> {
    try {
      const pkg = await this.readPackageJson();
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['next']) return 'next';
      if (deps['vite']) return 'vite';
      if (deps['react']) return 'react';
      if (deps['vue']) return 'vue';
      if (deps['svelte']) return 'svelte';
      if (deps['astro']) return 'astro';
      if (deps['@angular/core']) return 'angular';

      return 'vanilla';
    } catch {
      return 'unknown';
    }
  }

  /** Installs all dependencies in the project directory. */
  async installAll(): Promise<void> {
    await PackageManagerTool.install(this.projectRoot);
  }

  /** Adds new packages to the project. */
  async add(packages: string[], dev = false): Promise<void> {
    await PackageManagerTool.add(packages, this.projectRoot, dev);
  }

  /** Returns whether package.json exists in the project root. */
  hasPackageJson(): boolean {
    return FilesystemTool.exists(path.join(this.projectRoot, 'package.json'));
  }
}
