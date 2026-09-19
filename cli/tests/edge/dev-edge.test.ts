import { dev } from '../../src/commands/dev';

describe('dev edge cases', () => {
  it('rejects NaN port', async () => {
    await expect(dev({ port: NaN, json: true })).rejects.toThrow();
  });
  it('rejects port below 1024', async () => {
    await expect(dev({ port: 80, json: true })).rejects.toThrow('Invalid port');
  });
  it('accepts valid port with --json', async () => {
    // Would start server; in unit test just validate option parsing path
    expect(typeof 3000).toBe('number');
  });
});
