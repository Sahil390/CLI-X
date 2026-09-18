import { log } from '../ui/logger.js';
import { readdir } from 'fs/promises';
import path from 'path';
import { fileExists } from '../utils/fs.js';

const BUILT_IN_TEMPLATES = [
  { name: 'default', description: 'A clean static site with HTML, CSS, and JavaScript' },
  { name: 'blog', description: 'A blog template with post listings' },
  { name: 'portfolio', description: 'A portfolio site with projects and contact' },
];

export async function templates(action?: string): Promise<void> {
  log.title('Templates');

  switch (action) {
    case 'list':
    case undefined: {
      log.success('Built-in templates:');
      for (const t of BUILT_IN_TEMPLATES) {
        log.step(BUILT_IN_TEMPLATES.indexOf(t) + 1, `${t.name}: ${t.description}`);
      }

      const customDir = path.join(process.cwd(), 'templates');
      if (await fileExists(customDir)) {
        const entries = await readdir(customDir);
        if (entries.length > 0) {
          log.info('Custom templates:');
          for (const name of entries) {
            log.step(0, name);
          }
        }
      }
      break;
    }
    case 'create':
    case 'new': {
      log.info('Use wb init <name> with a template to create a new project.');
      break;
    }
    default: {
      log.warn(`Unknown action: ${action}`);
    }
  }
}
