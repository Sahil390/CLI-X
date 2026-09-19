import { callPython } from '../bridge/python.js';
import { createSpinner, stopWithSuccess, stopWithFailure } from '../ui/spinner.js';
import { log } from '../ui/logger.js';
import path from 'path';
import { resolveSourceDir, resolveOutputDir } from '../utils/path.js';
import { readJson, fileExists, countFiles, getFileSize } from '../utils/fs.js';
import type { BuildResult } from '../types/index.js';

export async function build(options: { watch?: boolean; json?: boolean } = {}): Promise<void> {
  log.title('Building Site');
  const spinner = createSpinner('Building...');

  const inputDir = resolveSourceDir();
  const outputDir = resolveOutputDir();

  if (!(await fileExists(inputDir))) {
    spinner.fail(`Source directory not found: ${inputDir}`);
    log.error('Run "wb init" first or create a src/ directory.');
    const msg = `Build failed: source directory missing (${inputDir}). State: inputDir=${inputDir}, outputDir=${outputDir}`;
    if (options.json) console.error(JSON.stringify({ error: msg, code: 'BUILD_ERROR', state: { inputDir, outputDir } }));
    else console.error(msg);
    process.exit(1);
  }

  const startTime = Date.now();

  const result = await callPython({
    modulePath: 'backend.build.engine',
    args: ['--input', inputDir, '--output', outputDir, '--minify'],
  });

  const duration = Date.now() - startTime;

  if (!result.success || !result.data) {
    stopWithFailure(spinner, 'Build failed');
    const msg = `Build failed: ${result.error || 'Unknown error'}. State: inputDir=${inputDir}, outputDir=${outputDir}`;
    if (options.json) console.error(JSON.stringify({ error: msg, code: 'BUILD_ERROR', state: { inputDir, outputDir } }));
    else log.error(msg);
    process.exit(1);
  }

  const buildResult: BuildResult = {
    files: result.data.files as number ?? 0,
    sizeBytes: result.data.sizeBytes as number ?? 0,
    duration,
    outputDir,
    errors: (result.data.errors as string[]) ?? [],
  };

  stopWithSuccess(spinner, `Build complete in ${duration}ms`);

  const fileCount = buildResult.files || (await countFiles(outputDir));
  const totalSize = buildResult.sizeBytes || (await getFileSize(outputDir));

  if (options.json) {
    console.log(JSON.stringify({ status: 'build_complete', files: buildResult.files, sizeBytes: buildResult.sizeBytes, duration, outputDir, errors: buildResult.errors }));
  } else {
    log.success(`Output: ${outputDir}`);
    log.info(`Files: ${fileCount} | Size: ${formatBytes(totalSize)} | Time: ${duration}ms`);
    if (buildResult.errors.length > 0) {
      log.warn(`Warnings (${buildResult.errors.length}):`);
      for (const err of buildResult.errors) {
        log.dim(`  - ${err}`);
      }
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
