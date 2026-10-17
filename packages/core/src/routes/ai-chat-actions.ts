import { createHash } from 'node:crypto';

import { generateStandardId } from '@logto/shared';
import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { enabledLogtoMcpTools, type LogtoMcpTool } from './mcp-logto-tools.js';

// Ask AI writes go through a pending action. The server stores the exact request body when the
// write is proposed and only sends it after the user confirms that action's id. Confirming never
// takes a payload from the client, and the stored body is checked against its hash before it runs.

export const pendingActionTtlMs = 5 * 60 * 1000;

type PendingActionState = 'pending' | 'confirmed' | 'executed' | 'cancelled' | 'expired';

export type PendingAction = {
  id: string;
  tenantId: string;
  userId: string;
  tool: string;
  /** The exact Management API request body. Stored as proposed, never rebuilt on confirm. */
  body: Record<string, unknown>;
  bodyHash: string;
  state: PendingActionState;
  result: unknown;
  expiresAt: Date;
};

export type PendingActionStore = {
  insert: (action: PendingAction) => Promise<void>;
  findById: (id: string, tenantId: string) => Promise<PendingAction | undefined>;
  /** Moves a pending, unexpired action of this user to `confirmed`. Only one caller can win. */
  claim: (
    id: string,
    tenantId: string,
    userId: string,
    now: Date
  ) => Promise<PendingAction | undefined>;
  /** Cancels a pending action of this user. Returns false when it was not pending. */
  cancel: (id: string, tenantId: string, userId: string) => Promise<boolean>;
  setOutcome: (
    id: string,
    state: 'executed' | 'cancelled' | 'expired',
    result: unknown
  ) => Promise<void>;
};

/** Stable JSON: keys sorted at every level, so jsonb's key reordering does not change the hash. */
const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .toSorted(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
};

export const hashBody = (body: Record<string, unknown>) =>
  createHash('sha256').update(canonicalJson(body)).digest('hex');

type ProposeResult =
  | { ok: true; action: PendingAction }
  | { ok: false; code: 'disabled' | 'unknown_tool' | 'invalid_arguments' };

/**
 * Stores a write as a pending action. Nothing reaches the Management API here: the model and the
 * user only see the stored body, and the write runs later through `confirmPendingAction`.
 */
export const proposePendingAction = async ({
  store,
  tool,
  args,
  userId,
  tenantId,
  now,
  isDevFeaturesEnabled,
  newId = generateStandardId,
}: {
  store: PendingActionStore;
  tool: string;
  args: Record<string, unknown>;
  userId: string;
  tenantId: string;
  now: Date;
  isDevFeaturesEnabled: boolean;
  newId?: () => string;
}): Promise<ProposeResult> => {
  if (!isDevFeaturesEnabled) {
    return { ok: false, code: 'disabled' };
  }

  const found = enabledLogtoMcpTools(isDevFeaturesEnabled).find(({ name }) => name === tool);

  if (!found || found.method !== 'POST') {
    return { ok: false, code: 'unknown_tool' };
  }

  const body = found.body?.(args);

  if (!body) {
    return { ok: false, code: 'invalid_arguments' };
  }

  const action: PendingAction = {
    id: newId(),
    tenantId,
    userId,
    tool: found.name,
    body,
    bodyHash: hashBody(body),
    state: 'pending',
    result: null,
    expiresAt: new Date(now.getTime() + pendingActionTtlMs),
  };

  await store.insert(action);

  return { ok: true, action };
};

export type ConfirmResult =
  | { ok: true; result: CallToolResult }
  | {
      ok: false;
      code: 'disabled' | 'not_found' | 'not_pending' | 'expired' | 'tampered' | 'unknown_tool';
    };

/**
 * Runs a pending action once. The action is claimed first, so a replayed or concurrent confirm
 * finds it no longer pending. Only the stored body is sent, and only if it still matches its hash.
 */
export const confirmPendingAction = async ({
  store,
  id,
  tenantId,
  userId,
  now,
  isDevFeaturesEnabled,
  execute,
}: {
  store: PendingActionStore;
  id: string;
  tenantId: string;
  userId: string;
  now: Date;
  isDevFeaturesEnabled: boolean;
  execute: (tool: LogtoMcpTool, body: Record<string, unknown>) => Promise<CallToolResult>;
}): Promise<ConfirmResult> => {
  if (!isDevFeaturesEnabled) {
    return { ok: false, code: 'disabled' };
  }

  const claimed = await store.claim(id, tenantId, userId, now);

  if (!claimed) {
    const existing = await store.findById(id, tenantId);

    // Another user's action is reported as not found, so ids cannot be probed across users.
    if (!existing || existing.userId !== userId) {
      return { ok: false, code: 'not_found' };
    }

    if (existing.state === 'pending') {
      await store.setOutcome(id, 'expired', null);

      return { ok: false, code: 'expired' };
    }

    return { ok: false, code: 'not_pending' };
  }

  const tool = enabledLogtoMcpTools(isDevFeaturesEnabled).find(({ name }) => name === claimed.tool);

  if (!tool) {
    await store.setOutcome(id, 'cancelled', { reason: 'unknown_tool' });

    return { ok: false, code: 'unknown_tool' };
  }

  if (hashBody(claimed.body) !== claimed.bodyHash) {
    await store.setOutcome(id, 'cancelled', { reason: 'tampered' });

    return { ok: false, code: 'tampered' };
  }

  const result = await execute(tool, claimed.body);
  await store.setOutcome(id, 'executed', result);

  return { ok: true, result };
};

/** A Postgres-backed store. Rows are scoped to the tenant by tenant_id and by row-level security. */
export const createPendingActionStore = (pool: CommonQueryMethods): PendingActionStore => {
  const insert: PendingActionStore['insert'] = async (action) => {
    await pool.query(sql`
      insert into ai_pending_actions
        (id, tenant_id, user_id, tool, arguments, arguments_hash, state, expires_at)
      values
        (${action.id}, ${action.tenantId}, ${action.userId}, ${action.tool},
         ${JSON.stringify(action.body)}::jsonb, ${action.bodyHash}, ${action.state},
         ${action.expiresAt.toISOString()})
    `);
  };

  const findById: PendingActionStore['findById'] = async (id, tenantId) =>
    (await pool.maybeOne<PendingAction>(sql`
      select id, tenant_id as "tenantId", user_id as "userId", tool,
        arguments as body, arguments_hash as "bodyHash", state, result,
        expires_at as "expiresAt"
      from ai_pending_actions
      where id = ${id} and tenant_id = ${tenantId}
    `)) ?? undefined;

  const claim: PendingActionStore['claim'] = async (id, tenantId, userId, now) =>
    (await pool.maybeOne<PendingAction>(sql`
      update ai_pending_actions
        set state = 'confirmed', updated_at = now()
      where id = ${id} and tenant_id = ${tenantId} and user_id = ${userId}
        and state = 'pending' and expires_at > ${now.toISOString()}
      returning id, tenant_id as "tenantId", user_id as "userId", tool,
        arguments as body, arguments_hash as "bodyHash", state, result,
        expires_at as "expiresAt"
    `)) ?? undefined;

  const cancel: PendingActionStore['cancel'] = async (id, tenantId, userId) => {
    const { rowCount } = await pool.query(sql`
      update ai_pending_actions
        set state = 'cancelled', updated_at = now()
      where id = ${id} and tenant_id = ${tenantId} and user_id = ${userId} and state = 'pending'
    `);

    return rowCount > 0;
  };

  const setOutcome: PendingActionStore['setOutcome'] = async (id, state, result) => {
    await pool.query(sql`
      update ai_pending_actions
        set state = ${state}, result = ${JSON.stringify(result ?? null)}::jsonb, updated_at = now()
      where id = ${id}
    `);
  };

  return { insert, findById, claim, cancel, setOutcome };
};
