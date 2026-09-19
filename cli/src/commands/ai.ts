import { callPython } from '../bridge/python.js';
import { HttpApiClient, GenerateRequest } from '../bridge/http-api.js';
import { createSpinner, stopWithSuccess, stopWithFailure } from '../ui/spinner.js';
import { log } from '../ui/logger.js';
import { fileExists } from '../utils/fs.js';
import { projectRoot } from '../utils/path.js';
import fse from 'fs-extra';
import path from 'path';

export async function ai(promptText: string, options: { style?: string; template?: string; interactive?: boolean; json?: boolean } = {}): Promise<void> {
  log.title('AI Site Generation');

  const apiClient = new HttpApiClient();

  if (await apiClient.isAvailable()) {
    log.info('Using AI API service');
    await generateViaApi(apiClient, promptText, options);
  } else {
    log.info('Using subprocess mode');
    await generateViaSubprocess(promptText, options);
  }
}

async function generateViaApi(
  client: HttpApiClient,
  promptText: string,
  options: { style?: string; template?: string },
): Promise<void> {
  const request: GenerateRequest = {
    prompt: promptText,
    style: options.style || 'modern',
    template: options.template || 'default',
  };

  const spinner = createSpinner('Generating with AI...');

  const result = await client.generate(request);

  if (result.error) {
    stopWithFailure(spinner, result.error);
    log.error(result.error);
    return;
  }

  stopWithSuccess(spinner, 'Generation complete');
  await writeGeneratedFiles(result);
}

async function generateViaSubprocess(
  promptText: string,
  options: { style?: string; template?: string },
): Promise<void> {
  const spinner = createSpinner('Generating with AI...');

  const args = ['--prompt', promptText, '--output', path.join(projectRoot(), 'src')];
  if (options.style) args.push('--style', options.style);
  if (options.template) args.push('--template', options.template);

  const result = await callPython({
    modulePath: 'backend.ai.generator',
    args,
    timeout: 120000,
  });

  if (!result.success || !result.data) {
    stopWithFailure(spinner, 'Generation failed');
    log.error(result.error || 'Unknown error');
    return;
  }

  stopWithSuccess(spinner, 'Generation complete');

  if (result.data.files && typeof result.data.files === 'object') {
    for (const [filePath, content] of Object.entries(result.data.files as Record<string, string>)) {
      const fullPath = path.join(projectRoot(), filePath);
      await fse.ensureDir(path.dirname(fullPath));
      await fse.writeFile(fullPath, content);
    }
    log.success('Files written to project');
  }
}

async function writeGeneratedFiles(result: any): Promise<void> {
  const files: Record<string, string> = result.files || {};
  const baseDir = projectRoot();

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(baseDir, filePath);
    await fse.ensureDir(path.dirname(fullPath));
    await fse.writeFile(fullPath, content);
  }

  if (result.html) {
    const indexPath = path.join(baseDir, 'src', 'index.html');
    await fse.ensureDir(path.dirname(indexPath));
    await fse.writeFile(indexPath, result.html);
  }

  if (result.css) {
    const cssPath = path.join(baseDir, 'src', 'style.css');
    await fse.writeFile(cssPath, result.css);
  }

  if (result.js) {
    const jsPath = path.join(baseDir, 'src', 'main.js');
    await fse.writeFile(jsPath, result.js);
  }

  log.success('Generated files written to src/');
}
