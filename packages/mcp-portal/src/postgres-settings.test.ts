import type { CommonQueryMethods } from '@silverhand/slonik';
import { describe, expect, it, vi } from 'vitest';

import { PostgresPortalSettingsStore } from './postgres-settings.js';

describe('PostgresPortalSettingsStore', () => {
  it('upserts the default row with tenant-aware conflict columns', async () => {
    const query = vi.fn(async (_statement: { sql: string }) => ({ rowCount: 1, rows: [] }));
    const maybeOne = vi.fn(async () => ({ baseDomain: 'mcp.example.com' }));
    const store = new PostgresPortalSettingsStore({
      query,
      maybeOne,
    } as unknown as CommonQueryMethods);

    await store.setBaseDomain('mcp.example.com');

    expect(query.mock.calls[0]?.[0].sql).toContain('on conflict (tenant_id, id)');
  });
});
