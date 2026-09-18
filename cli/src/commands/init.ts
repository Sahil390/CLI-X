import fse from 'fs-extra';
import path from 'path';
import { prompt, select, input, confirm } from '../ui/prompts.js';
import { log } from '../ui/logger.js';
import { copyDir, ensureDir, writeJson, fileExists } from '../utils/fs.js';
import { projectRoot } from '../utils/path.js';
import type { TemplateInfo } from '../types/index.js';

const TEMPLATES: TemplateInfo[] = [
  {
    name: 'default',
    description: 'A clean static site with HTML, CSS, and JavaScript',
    pages: ['index.html'],
    hasStyles: true,
    hasScripts: true,
  },
  {
    name: 'blog',
    description: 'A blog template with post listings and article pages',
    pages: ['index.html', 'post.html'],
    hasStyles: true,
    hasScripts: true,
  },
  {
    name: 'portfolio',
    description: 'A portfolio site with project showcase and contact',
    pages: ['index.html', 'projects.html', 'contact.html'],
    hasStyles: true,
    hasScripts: true,
  },
];

export async function init(name?: string): Promise<void> {
  log.title('Initialize New Website');

  const projectName = name || (await input('Project name', 'my-site'));

  log.step(1, 'Choose a template');
  const templateChoices = TEMPLATES.map((t) => ({ name: `${t.name} — ${t.description}`, value: t.name }));
  const template = (await select('Select a template', templateChoices)) as string;

  const targetDir = path.join(projectRoot(), projectName);
  if (await fileExists(targetDir)) {
    const overwrite = await confirm(`Directory "${projectName}" already exists. Overwrite?`);
    if (!overwrite) {
      log.warn('Aborted.');
      return;
    }
    await fse.remove(targetDir);
  }

  await ensureDir(targetDir);

  const templateDir = path.join(__dirname, '..', '..', '..', 'backend', 'backend', 'templates', template);
  if (await fileExists(templateDir)) {
    await copyDir(templateDir, targetDir);
    log.success(`Copied ${template} template to ${projectName}/`);
  } else {
    const indexPath = path.join(targetDir, 'index.html');
    await writeJson(indexPath, { html: '<!DOCTYPE html><html><head><title>' + projectName + '</title></head><body><h1>Hello</h1></body></html>' });
    log.success(`Created basic site in ${projectName}/`);
  }

  const config = {
    name: projectName,
    template,
    build: { input: 'src', output: 'dist' },
    deploy: { target: 'local' },
  };
  await writeJson(path.join(targetDir, 'website-builder.config.json'), config as any);
  log.success('Created website-builder.config.json');

  const readme = `# ${projectName}\n\nBuilt with Website Builder\n`;
  await fse.writeFile(path.join(targetDir, 'README.md'), readme);

  log.success(`\n🚀 Project "${projectName}" created!\n`);
  log.command(`cd ${projectName}`);
  log.command('wb build');
}
