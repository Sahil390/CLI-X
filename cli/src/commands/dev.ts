import http from 'http';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';
import { log } from '../ui/logger.js';
import { resolveSourceDir, resolveOutputDir } from '../utils/path.js';
import { fileExists } from '../utils/fs.js';

interface DevServerOptions {
  port?: number;
  open?: boolean;
}

export async function dev(options: DevServerOptions = {}): Promise<void> {
  const port = options.port || 3000;
  const inputDir = resolveSourceDir();
  const outputDir = resolveOutputDir();

  log.title('Starting Dev Server');
  log.info(`Port: ${port}`);
  log.info(`Watching: ${inputDir}`);

  await fs.promises.mkdir(outputDir, { recursive: true });

  const server = http.createServer((req, res) => {
    let filePath = path.join(inputDir, req.url === '/' ? 'index.html' : req.url || '');
    const ext = path.extname(filePath);
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
    };

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  const wss = new WebSocketServer({ server, path: '/__hmr' });

  wss.on('connection', (ws) => {
    log.dim('Client connected for HMR');
  });

  function broadcastChange(filePath: string) {
    const relative = path.relative(inputDir, filePath);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'file-change', path: relative }));
      }
    }
  }

  const watcher = chokidar.watch(inputDir, {
    ignored: /node_modules/,
    persistent: true,
  });

  watcher.on('change', (filePath) => {
    log.dim(`File changed: ${filePath}`);
    broadcastChange(filePath);
  });

  watcher.on('add', (filePath) => {
    log.dim(`File added: ${filePath}`);
    broadcastChange(filePath);
  });

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      log.success(`Dev server running at http://localhost:${port}`);
      resolve();
    });
  });
}
