import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { FilesystemTool } from '../src/tools/filesystem';
import { ShellTool } from '../src/tools/shell';

describe('FilesystemTool', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-x-fs-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes and reads a file', async () => {
    const filePath = path.join(tmpDir, 'hello.txt');
    await FilesystemTool.writeFile(filePath, 'Hello, CLI-X!');
    const content = await FilesystemTool.readFile(filePath);
    expect(content).toBe('Hello, CLI-X!');
  });

  it('creates parent directories on write', async () => {
    const filePath = path.join(tmpDir, 'nested', 'dir', 'file.txt');
    await FilesystemTool.writeFile(filePath, 'nested content');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('appends to an existing file', async () => {
    const filePath = path.join(tmpDir, 'append.txt');
    await FilesystemTool.writeFile(filePath, 'line1\n');
    await FilesystemTool.appendFile(filePath, 'line2\n');
    const content = await FilesystemTool.readFile(filePath);
    expect(content).toBe('line1\nline2\n');
  });

  it('returns true for existing path', () => {
    expect(FilesystemTool.exists(tmpDir)).toBe(true);
  });

  it('returns false for non-existent path', () => {
    expect(FilesystemTool.exists(path.join(tmpDir, 'nonexistent'))).toBe(false);
  });

  it('lists directory contents', async () => {
    fs.writeFileSync(path.join(tmpDir, 'a.txt'), 'a');
    fs.writeFileSync(path.join(tmpDir, 'b.txt'), 'b');

    const entries = await FilesystemTool.listDir(tmpDir);
    const names = entries.map((e) => e.name);
    expect(names).toContain('a.txt');
    expect(names).toContain('b.txt');
  });

  it('deletes a file', async () => {
    const filePath = path.join(tmpDir, 'delete-me.txt');
    await FilesystemTool.writeFile(filePath, 'bye');
    await FilesystemTool.deleteFile(filePath);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('writes and reads JSON', async () => {
    const filePath = path.join(tmpDir, 'data.json');
    await FilesystemTool.writeJson(filePath, { key: 'value', num: 42 });
    const data = await FilesystemTool.readJson<{ key: string; num: number }>(filePath);
    expect(data.key).toBe('value');
    expect(data.num).toBe(42);
  });
});

describe('ShellTool', () => {
  it('runs a command and captures stdout', async () => {
    const result = await ShellTool.run('echo', ['hello']);
    expect(result.stdout.trim()).toBe('hello');
    expect(result.exitCode).toBe(0);
  });

  it('returns non-zero exit code on failure', async () => {
    const result = await ShellTool.run('false', []);
    expect(result.exitCode).not.toBe(0);
  });

  it('checks tool availability', async () => {
    const nodeAvailable = await ShellTool.isAvailable('node');
    expect(nodeAvailable).toBe(true);

    const fakeAvailable = await ShellTool.isAvailable('definitely-not-a-real-tool-xyz');
    expect(fakeAvailable).toBe(false);
  });

  it('gets node version', async () => {
    const version = await ShellTool.getVersion('node');
    expect(version).toBeTruthy();
    expect(version).toMatch(/^v\d+\.\d+\.\d+/);
  });
});
