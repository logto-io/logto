import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import { getWafConfig, invalidateWafConfig, updateWafConfig } from './config.js';

const { jest } = import.meta;
const query = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => query(sql, values),
});

const adminConfig = (waf?: {
  mode: 'off' | 'report' | 'block';
  maxRequestTargetLength: number;
}) => ({
  value: {
    signInExperienceCustomized: false,
    organizationCreated: false,
    ...(waf && { waf }),
  },
});

beforeEach(() => {
  query.mockReset();
  invalidateWafConfig();
});

describe('getWafConfig()', () => {
  it('loads persisted admin configuration', async () => {
    query.mockResolvedValueOnce(
      createMockQueryResult([adminConfig({ mode: 'block', maxRequestTargetLength: 4096 }) as never])
    );

    await expect(getWafConfig(pool)).resolves.toEqual({
      mode: 'block',
      maxRequestTargetLength: 4096,
    });
  });

  it('uses defaults when no WAF config is stored', async () => {
    query.mockResolvedValueOnce(createMockQueryResult([adminConfig() as never]));

    await expect(getWafConfig(pool)).resolves.toEqual({
      mode: 'report',
      maxRequestTargetLength: 8192,
    });
  });

  it('caches reads and reloads after invalidation', async () => {
    query
      .mockResolvedValueOnce(
        createMockQueryResult([
          adminConfig({ mode: 'report', maxRequestTargetLength: 8192 }) as never,
        ])
      )
      .mockResolvedValueOnce(
        createMockQueryResult([adminConfig({ mode: 'off', maxRequestTargetLength: 4096 }) as never])
      );

    await getWafConfig(pool);
    await getWafConfig(pool);
    expect(query).toHaveBeenCalledTimes(1);

    invalidateWafConfig();
    await expect(getWafConfig(pool)).resolves.toEqual({
      mode: 'off',
      maxRequestTargetLength: 4096,
    });
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('caches a report-mode fallback during a database outage', async () => {
    query.mockRejectedValueOnce(new Error('database unavailable'));

    await expect(getWafConfig(pool)).resolves.toEqual({
      mode: 'report',
      maxRequestTargetLength: 8192,
    });
    await getWafConfig(pool);

    expect(query).toHaveBeenCalledTimes(1);
  });

  it('retains the last valid policy when a refresh fails', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    query.mockResolvedValueOnce(
      createMockQueryResult([adminConfig({ mode: 'block', maxRequestTargetLength: 4096 }) as never])
    );
    await getWafConfig(pool);
    now.mockReturnValue(6001);
    query.mockRejectedValueOnce(new Error('database unavailable'));

    await expect(getWafConfig(pool)).resolves.toEqual({
      mode: 'block',
      maxRequestTargetLength: 4096,
    });
    now.mockRestore();
  });

  it('refreshes cached policy after five seconds', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    query
      .mockResolvedValueOnce(
        createMockQueryResult([
          adminConfig({ mode: 'report', maxRequestTargetLength: 8192 }) as never,
        ])
      )
      .mockResolvedValueOnce(
        createMockQueryResult([adminConfig({ mode: 'off', maxRequestTargetLength: 4096 }) as never])
      );

    await getWafConfig(pool);
    now.mockReturnValue(6001);

    await expect(getWafConfig(pool)).resolves.toEqual({
      mode: 'off',
      maxRequestTargetLength: 4096,
    });
    expect(query).toHaveBeenCalledTimes(2);
    now.mockRestore();
  });
});

describe('updateWafConfig()', () => {
  it('updates the admin policy and makes it immediately readable', async () => {
    const config = { mode: 'off' as const, maxRequestTargetLength: 4096 };
    query.mockResolvedValueOnce(createMockQueryResult([]));

    await expect(updateWafConfig(pool, config)).resolves.toEqual(config);
    await expect(getWafConfig(pool)).resolves.toEqual(config);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
