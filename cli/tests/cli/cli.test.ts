import { program } from '../../src/cli';

describe('CLI program', () => {
  it('should be defined', () => {
    expect(program).toBeDefined();
  });

  it('should have init command', () => {
    const cmd = program.commands.find((c) => c.name() === 'init');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Initialize a new website project');
  });

  it('should have build command', () => {
    const cmd = program.commands.find((c) => c.name() === 'build');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Build the site for production');
  });

  it('should have dev command', () => {
    const cmd = program.commands.find((c) => c.name() === 'dev');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Start development server');
  });

  it('should have deploy command', () => {
    const cmd = program.commands.find((c) => c.name() === 'deploy');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Deploy the site');
  });

  it('should have login command', () => {
    const cmd = program.commands.find((c) => c.name() === 'login');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Authenticate with a provider');
  });

  it('should have logout command', () => {
    const cmd = program.commands.find((c) => c.name() === 'logout');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Clear authentication session');
  });

  it('should have ai command', () => {
    const cmd = program.commands.find((c) => c.name() === 'ai');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Generate site content with AI');
  });

  it('should have config command', () => {
    const cmd = program.commands.find((c) => c.name() === 'config');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('View and set configuration');
  });

  it('should have templates command', () => {
    const cmd = program.commands.find((c) => c.name() === 'templates');
    expect(cmd).toBeDefined();
    expect(cmd?.description()).toBe('Manage and list templates');
  });

  it('should have wb alias', () => {
    expect(program._alias).toBe('wb');
  });

  it('should have version set', () => {
    expect(program.version()).toContain('0.1.0');
  });
});
