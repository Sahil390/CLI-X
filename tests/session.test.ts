import { SessionManager } from '../src/application/session-manager';

// Migrated from cli/tests/session.test.ts with updated import paths

describe('SessionManager', () => {
  it('adds and retrieves in-memory messages', async () => {
    const session = new SessionManager();

    await session.addMessage('user', 'Hello');
    await session.addMessage('assistant', 'Hi there!');

    const messages = session.getMessages();
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('Hello');
    expect(messages[1].role).toBe('assistant');
  });

  it('adds timestamps to messages', async () => {
    const session = new SessionManager();
    const before = new Date().toISOString();
    await session.addMessage('user', 'Test');
    const after = new Date().toISOString();

    const messages = session.getMessages();
    expect(messages[0].timestamp).toBeDefined();
    expect(messages[0].timestamp >= before).toBe(true);
    expect(messages[0].timestamp <= after).toBe(true);
  });

  it('returns empty array when no messages', () => {
    const session = new SessionManager();
    expect(session.getMessages()).toHaveLength(0);
  });

  it('is not persistent without bound project', () => {
    const session = new SessionManager();
    expect(session.isPersistent).toBe(false);
  });

  it('clears in-memory messages', async () => {
    const session = new SessionManager();
    await session.addMessage('user', 'One');
    await session.addMessage('user', 'Two');
    session.clear();
    expect(session.getMessages()).toHaveLength(0);
  });
});
