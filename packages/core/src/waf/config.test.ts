import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import { getWafConfig, invalidateWafConfig } from './config.js';

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
});
