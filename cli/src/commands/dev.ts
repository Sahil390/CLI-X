import http from 'http';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import chokidar from 'chokidar';
import { WebSocketServer, WebSocket } from 'ws';
import { callPython } from '../bridge/python.js';
import { log } from '../ui/logger.js';
import { resolveSourceDir, resolveOutputDir } from '../utils/path.js';
import { fileExists } from '../utils/fs.js';

interface DevServerOptions {
  port?: number;
  open?: boolean;
}

export async function dev(options: DevServerOptions & { json?: boolean } = {}): Promise<void> {
  const rawPort = options.port || 3000;
  const port = typeof rawPort === 'number' ? rawPort : parseInt(rawPort as unknown as string, 10);
  if (Number.isNaN(port) || port < 1024 || port > 65535) {
    const msg = `Invalid port: ${rawPort}. Must be 1024-65535.`;
    if (options.json) console.log(JSON.stringify({ error: msg, code: 'DEV_ERROR' }));
    else console.error(msg);
    process.exit(1);
  }
  const inputDir = resolveSourceDir();
  const outputDir = resolveOutputDir();

  log.title('Starting Dev Server');
  log.info(`Port: ${port}`);
  log.info(`Watching: ${inputDir}`);

  // Check API key — prompt if missing
  if (!process.env.OPENAI_API_KEY) {
    const keyRl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\n🔑 OpenAI API Key is required to run the AI Site Builder.');
    keyRl.question('Enter your API Key: ', (key: string) => {
      process.env.OPENAI_API_KEY = key.trim();
      console.log('✅ Key saved to process.env and config.');
      try { const { saveConfig } = require('../utils/config.js'); saveConfig({ openai_api_key: key.trim() }); } catch { /* optional */ }
      keyRl.close();
    });
  }

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

  // Mute minor watcher logs during REPL to preserve prompt visual flow; keep errors/reload events
  watcher.on('change', (filePath) => {
    // Only log reload events (major file changes), suppress noisy continuous updates
    if (filePath.endsWith('.html')) {
      log.dim(`🔄 Reload: ${path.basename(filePath)}`);
    }
    broadcastChange(filePath);
  });

  watcher.on('add', (filePath) => {
    if (filePath.endsWith('.html')) {
      log.dim(`📥 Added: ${path.basename(filePath)}`);
    }
    broadcastChange(filePath);
  });

  if (options.json) {
    console.log(JSON.stringify({ status: 'dev_server_started', port, inputDir, outputDir }));
  }
  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      log.success(`Dev server running at http://localhost:${port}`);
      resolve();
    });
  });

  // --- AI REPL (god-mode) ---
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '✨ AI > ',
  });

  // Clear terminal clutter and show persistent prompt
  console.clear();
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           🌐  AI REPL  —  Interactive Site Builder          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  log.info('Type an instruction and press Enter. Type "exit" or "quit" to close.\n');

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (input === 'exit' || input === 'quit') {
      console.log('\n👋 Shutting down dev server...');
      server.close();
      rl.close();
      process.exit(0);
    }

    if (!input) {
      rl.prompt();
      return;
    }

    // Temporarily pause prompt during generation
    rl.pause();
    console.log('⏳ Generating...');

    try {
      const result = await callPython({
        modulePath: 'backend.cli',
        args: ['ai', '--prompt', input, '--output', 'src', '--style', 'modern'],
      });

      if (result.success) {
        console.log('✅ Generated successfully — files updated.');
      } else {
        console.error('❌ Generation failed:', result.error || 'Unknown error');
      }
    } catch (e: any) {
      console.error('❌ Error:', e.message || e);
    }

    // Re-display prompt for chaining
    rl.resume();
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n👋 REPL closed.');
    server.close();
    process.exit(0);
  });
}
