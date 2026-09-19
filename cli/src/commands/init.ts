import fse from 'fs-extra';
import path from 'path';
import { log } from '../ui/logger.js';
import { copyDir, ensureDir, writeJson, fileExists, readJson } from '../utils/fs.js';
import { projectRoot } from '../utils/path.js';
import type { TemplateInfo } from '../types/index.js';

const TEMPLATES: TemplateInfo[] = [
  { name: 'default', description: 'A clean static site with HTML, CSS, and JavaScript', pages: ['index.html'], hasStyles: true, hasScripts: true },
  { name: 'blog', description: 'A blog template with post listings and article pages', pages: ['index.html', 'post.html'], hasStyles: true, hasScripts: true },
  { name: 'portfolio', description: 'A portfolio site with project showcase and contact', pages: ['index.html', 'projects.html', 'contact.html'], hasStyles: true, hasScripts: true },
];

export async function init(name?: string, options: { template?: string; interactive?: boolean; json?: boolean } = {}): Promise<void> {
  const json = options.json || false;
  if (json) {
    const result = { status: 'pending', name: name || 'untitled', template: options.template || 'default' };
    console.log(JSON.stringify(result));
  }

  log.title('Initialize New Website');

  let projectName = name;
  let template = options.template || 'default';

  if (!projectName || options.interactive) {
    // For pure non-interactive: if name missing and not interactive, fail safely
    if (!projectName && !options.interactive) {
      console.error('Error: Project name required. Usage: wb init <name> [--template ...]');
      process.exit(1);
    }
  }

  if (!projectName) {
    // In interactive mode we'd use prompt; keep simple fallback for now
    projectName = 'my-site';
  }

  const targetDir = path.join(projectRoot(), projectName);
  if (await fileExists(targetDir)) {
    // Non-interactive safe default: abort unless explicitly interactive
    if (!options.interactive) {
      console.error(`Error: Directory "${projectName}" already exists. Use a different name or pass --interactive.`);
      process.exit(1);
    }
    // If interactive, we'd prompt; for this refactor we abort safely
    console.error(`Error: Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  await ensureDir(targetDir);

  const templateDir = path.join(__dirname, '..', '..', '..', 'backend', 'backend', 'templates', template);
  if (await fileExists(templateDir)) {
    await copyDir(templateDir, targetDir);
    if (!json) log.success(`Copied ${template} template to ${projectName}/`);
  } else {
    const indexPath = path.join(targetDir, 'index.html');
    const html = `<!DOCTYPE html><html><head><title>${projectName}</title></head><body><h1>Hello</h1></body></html>`;
    await fse.writeFile(indexPath, html, 'utf-8');
    if (!json) log.success(`Created basic site in ${projectName}/`);
  }

  const config = { name: projectName, template, build: { input: 'src', output: 'dist' }, deploy: { target: 'local' } };
  await writeJson(path.join(targetDir, 'website-builder.config.json'), config as any);
  if (!json) log.success('Created website-builder.config.json');

  const readme = `# ${projectName}\n\nBuilt with Website Builder\n`;
  await fse.writeFile(path.join(targetDir, 'README.md'), readme, 'utf-8');

  if (json) {
    console.log(JSON.stringify({ status: 'success', project: projectName, template, files: ['website-builder.config.json', 'README.md', 'index.html'] }));
  } else {
    log.success(`\n🚀 Project "${projectName}" created!\n`);
    log.command(`cd ${projectName}`);
    log.command('wb build');
  }
}
