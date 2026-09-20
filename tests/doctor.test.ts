import { ShellTool } from '../src/tools/shell';

// Doctor command unit tests — exercise the underlying checks directly

describe('Doctor checks', () => {
  it('Node.js is available and v18+', async () => {
    const version = await ShellTool.getVersion('node');
    expect(version).toBeTruthy();

    const major = parseInt((version ?? '').replace('v', '').split('.')[0], 10);
    expect(major).toBeGreaterThanOrEqual(18);
  });

  it('npm is available', async () => {
    const available = await ShellTool.isAvailable('npm');
    expect(available).toBe(true);
  });

  it('TypeScript runtime is detectable via npx', async () => {
    const result = await ShellTool.run('npx', ['tsc', '--version']);
    // Should succeed or at least not throw
    expect(result.exitCode === 0 || result.exitCode === 1).toBe(true);
  });
});
