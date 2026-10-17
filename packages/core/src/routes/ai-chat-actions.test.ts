import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import {
  confirmPendingAction,
  hashBody,
  pendingActionTtlMs,
  type PendingAction,
  type PendingActionStore,
  proposePendingAction,
} from './ai-chat-actions.js';
import { type LogtoMcpTool } from './mcp-logto-tools.js';

/**
 * Covers src/routes/ai-chat-actions.ts. The store is an in-memory fake and the Management API call is
 * a stub, so nothing reaches a database or a real tenant. The Postgres store is checked separately.
 */
const { jest } = import.meta;

const now = new Date('2026-10-17T10:00:00Z');
const tenantId = 'tenant-1';
const owner = 'user-1';

const createFakeStore = () => {
  const rows = new Map<string, PendingAction>();

  const store: PendingActionStore = {
    insert: async (action) => {
      rows.set(action.id, { ...action });
    },
    findById: async (id, tenant) => {
      const row = rows.get(id);

      if (row?.tenantId === tenant) {
        return { ...row };
      }
    },
    claim: async (id, tenant, userId, at) => {
      const row = rows.get(id);

      if (
        !row ||
        row.tenantId !== tenant ||
        row.userId !== userId ||
        row.state !== 'pending' ||
        row.expiresAt <= at
      ) {
        return;
      }

      const claimed: PendingAction = { ...row, state: 'confirmed' };
      rows.set(id, claimed);
      return { ...claimed };
    },
    cancel: async (id, tenant, userId) => {
      const row = rows.get(id);

      if (!row || row.tenantId !== tenant || row.userId !== userId || row.state !== 'pending') {
        return false;
      }

      rows.set(id, { ...row, state: 'cancelled' });
      return true;
    },
    setOutcome: async (id, state, result) => {
      const row = rows.get(id);

      if (row) {
        rows.set(id, { ...row, state, result });
      }
    },
  };

  return { store, rows };
};

const okResult: CallToolResult = {
  content: [{ type: 'text', text: '{"id":"app-1"}' }],
  isError: false,
};

const propose = async (
  store: PendingActionStore,
  overrides: Partial<Parameters<typeof proposePendingAction>[0]> = {}
) =>
  proposePendingAction({
    store,
    tool: 'create_organization',
    args: { name: 'Acme', description: 'Team' },
    userId: owner,
    tenantId,
    now,
    isDevFeaturesEnabled: true,
    newId: () => 'action-1',
    ...overrides,
  });

const confirm = async (
  store: PendingActionStore,
  overrides: Partial<Parameters<typeof confirmPendingAction>[0]> = {}
) =>
  confirmPendingAction({
    store,
    id: 'action-1',
    tenantId,
    userId: owner,
    now,
    isDevFeaturesEnabled: true,
    execute: jest.fn(async () => okResult),
    ...overrides,
  });

describe('proposePendingAction', () => {
  it('stores the body and runs nothing', async () => {
    const { store, rows } = createFakeStore();
    const execute = jest.fn(async () => okResult);

    const result = await propose(store);

    expect(result.ok).toBe(true);
    expect(execute).not.toHaveBeenCalled();
    expect(rows.get('action-1')?.body).toEqual({ name: 'Acme', description: 'Team' });
    expect(rows.get('action-1')?.state).toBe('pending');
  });

  it('expires the proposal after the TTL', async () => {
    const { store, rows } = createFakeStore();

    await propose(store);

    expect(rows.get('action-1')?.expiresAt.getTime()).toBe(now.getTime() + pendingActionTtlMs);
  });

  it('refuses every proposal while dev features are disabled', async () => {
    const { store, rows } = createFakeStore();

    const result = await propose(store, { isDevFeaturesEnabled: false });

    expect(result).toEqual({ ok: false, code: 'disabled' });
    expect(rows.size).toBe(0);
  });

  it('refuses a read tool, which is not a write', async () => {
    const { store, rows } = createFakeStore();

    const result = await propose(store, { tool: 'list_applications', args: {} });

    expect(result).toEqual({ ok: false, code: 'unknown_tool' });
    expect(rows.size).toBe(0);
  });

  it('refuses a tool name that does not exist', async () => {
    const { store } = createFakeStore();

    expect(await propose(store, { tool: 'delete_tenant' })).toEqual({
      ok: false,
      code: 'unknown_tool',
    });
  });
});

describe('confirmPendingAction', () => {
  it('runs the stored body once, with the caller-approved payload', async () => {
    const { store } = createFakeStore();
    await propose(store);
    const execute = jest.fn(
      async (_tool: LogtoMcpTool, _body: Record<string, unknown>) => okResult
    );

    const result = await confirm(store, { execute });

    expect(result).toEqual({ ok: true, result: okResult });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0]?.[1]).toEqual({ name: 'Acme', description: 'Team' });
  });

  it('refuses a replayed confirm', async () => {
    const { store } = createFakeStore();
    await propose(store);
    await confirm(store);
    const execute = jest.fn(async () => okResult);

    const replay = await confirm(store, { execute });

    expect(replay).toEqual({ ok: false, code: 'not_pending' });
    expect(execute).not.toHaveBeenCalled();
  });

  it('refuses an unknown action id', async () => {
    const { store } = createFakeStore();

    expect(await confirm(store, { id: 'missing' })).toEqual({ ok: false, code: 'not_found' });
  });

  it('refuses another user confirming the action, without revealing that it exists', async () => {
    const { store } = createFakeStore();
    await propose(store);
    const execute = jest.fn(async () => okResult);

    const result = await confirm(store, { userId: 'user-2', execute });

    expect(result).toEqual({ ok: false, code: 'not_found' });
    expect(execute).not.toHaveBeenCalled();
  });

  it('refuses an action from another tenant', async () => {
    const { store } = createFakeStore();
    await propose(store);

    expect(await confirm(store, { tenantId: 'tenant-2' })).toEqual({
      ok: false,
      code: 'not_found',
    });
  });

  it('refuses an expired action and marks it expired', async () => {
    const { store, rows } = createFakeStore();
    await propose(store);
    const later = new Date(now.getTime() + pendingActionTtlMs + 1000);
    const execute = jest.fn(async () => okResult);

    const result = await confirm(store, { now: later, execute });

    expect(result).toEqual({ ok: false, code: 'expired' });
    expect(execute).not.toHaveBeenCalled();
    expect(rows.get('action-1')?.state).toBe('expired');
  });

  it('refuses everything while dev features are disabled, and changes no state', async () => {
    const { store, rows } = createFakeStore();
    await propose(store);
    const execute = jest.fn(async () => okResult);

    const result = await confirm(store, { isDevFeaturesEnabled: false, execute });

    expect(result).toEqual({ ok: false, code: 'disabled' });
    expect(execute).not.toHaveBeenCalled();
    expect(rows.get('action-1')?.state).toBe('pending');
  });

  it('refuses a stored body that no longer matches its hash', async () => {
    const { store, rows } = createFakeStore();
    await propose(store);
    const row = rows.get('action-1');

    if (row) {
      rows.set('action-1', {
        ...row,
        body: { name: 'Evil', description: 'Changed after proposal' },
      });
    }

    const execute = jest.fn(async () => okResult);
    const result = await confirm(store, { execute });

    expect(result).toEqual({ ok: false, code: 'tampered' });
    expect(execute).not.toHaveBeenCalled();
    expect(rows.get('action-1')?.state).toBe('cancelled');
  });

  it('still matches after jsonb reorders the keys of the stored body', async () => {
    const { store, rows } = createFakeStore();
    await propose(store);
    const row = rows.get('action-1');

    if (row) {
      rows.set('action-1', { ...row, body: { description: 'Team', name: 'Acme' } });
    }

    const execute = jest.fn(async () => okResult);

    expect(await confirm(store, { execute })).toEqual({ ok: true, result: okResult });
  });

  it('records the Management API outcome on the action', async () => {
    const { store, rows } = createFakeStore();
    await propose(store);

    await confirm(store);

    expect(rows.get('action-1')?.state).toBe('executed');
    expect(rows.get('action-1')?.result).toEqual(okResult);
  });
});

describe('hashBody', () => {
  it('does not depend on key order', () => {
    expect(hashBody({ a: 1, b: { c: 2, d: 3 } })).toBe(hashBody({ b: { d: 3, c: 2 }, a: 1 }));
  });

  it('changes when a value changes', () => {
    expect(hashBody({ name: 'Acme' })).not.toBe(hashBody({ name: 'Acne' }));
  });
});
