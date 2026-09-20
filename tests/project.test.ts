import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { ProjectMemory } from '../src/project/project-memory';
import { ChatHistory } from '../src/project/chat-history';
import { ProjectStateTool } from '../src/tools/project-state';

// Migrated from cli/tests/project.test.ts with updated import paths + new persistence tests

describe('Project memory', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-x-test-'));
    // Create a dummy package.json so it looks like a project
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ name: 'test' }));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('initializes .ai/ directory structure', async () => {
    const memory = new ProjectMemory(tmpDir);
    await memory.initialize();

    expect(fs.existsSync(path.join(tmpDir, '.ai'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'project.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'architecture.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'design.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'decisions.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'history.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'chat'))).toBe(true);
  });

  it('reads and writes project state', async () => {
    const memory = new ProjectMemory(tmpDir);
    await memory.initialize();

    await memory.writeProject({ name: 'test-project', framework: 'react' });
    const state = await memory.readProject();

    expect(state?.name).toBe('test-project');
    expect(state?.framework).toBe('react');
  });

  it('appends history events', async () => {
    const memory = new ProjectMemory(tmpDir);
    await memory.initialize();

    await memory.addHistoryEvent({ type: 'build', description: 'First build' });
    await memory.addHistoryEvent({ type: 'edit', description: 'UI update' });

    const history = await memory.readHistory();
    expect(history?.events).toHaveLength(2);
    expect(history?.events[0].type).toBe('build');
    expect(history?.events[1].description).toBe('UI update');
  });

  it('adds decisions with auto-generated ids', async () => {
    const memory = new ProjectMemory(tmpDir);
    await memory.initialize();

    await memory.addDecision({
      decision: 'Use React',
      rationale: 'Team familiarity',
    });

    const decisions = await memory.readDecisions();
    expect(decisions?.decisions).toHaveLength(1);
    expect(decisions?.decisions[0].id).toBeTruthy();
    expect(decisions?.decisions[0].decision).toBe('Use React');
  });
});

describe('Chat history (JSONL)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-x-chat-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('appends and reads messages', async () => {
    const chat = new ChatHistory(tmpDir);
    await chat.initialize();

    await chat.append('user', 'Hello CLI-X');
    await chat.append('assistant', 'Hello! How can I help?');

    const messages = await chat.readAll();
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('Hello CLI-X');
    expect(messages[1].role).toBe('assistant');
  });

  it('returns recent N messages', async () => {
    const chat = new ChatHistory(tmpDir);
    await chat.initialize();

    for (let i = 0; i < 10; i++) {
      await chat.append('user', `Message ${i}`);
    }

    const recent = await chat.getRecent(3);
    expect(recent).toHaveLength(3);
    expect(recent[2].content).toBe('Message 9');
  });

  it('returns correct message count', async () => {
    const chat = new ChatHistory(tmpDir);
    await chat.initialize();

    await chat.append('user', 'One');
    await chat.append('user', 'Two');
    await chat.append('user', 'Three');

    expect(await chat.count()).toBe(3);
  });

  it('clears history', async () => {
    const chat = new ChatHistory(tmpDir);
    await chat.initialize();

    await chat.append('user', 'Before clear');
    await chat.clear();

    expect(await chat.count()).toBe(0);
  });
});
