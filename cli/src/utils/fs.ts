import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';

export async function ensureDir(dirPath: string): Promise<void> {
  await fse.ensureDir(dirPath);
}

export async function copyDir(src: string, dest: string): Promise<void> {
  await fse.copy(src, dest, { overwrite: true } as any);
}

export async function readJson(filePath: string): Promise<Record<string, unknown>> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function writeJson(filePath: string, data: Record<string, unknown>): Promise<void> {
  await fse.ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  const stat = await fs.promises.stat(filePath);
  return stat.size;
}

export async function countFiles(dirPath: string): Promise<number> {
  let count = 0;
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      count += await countFiles(fullPath);
    } else {
      count++;
    }
  }
  return count;
}

export function expandHomePath(p: string): string {
  if (p.startsWith('~/')) {
    return path.join(process.env.HOME || process.env.USERPROFILE || '', p.slice(2));
  }
  return p;
}
