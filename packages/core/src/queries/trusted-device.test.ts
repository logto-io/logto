import { TrustedDevices, type TrustedDevice } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { expandFields } from '#src/database/utils.js';
import { convertToIdentifiers } from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});

const { TrustedDeviceQueries } = await import('./trusted-device.js');
const queries = new TrustedDeviceQueries(pool);

const { table, fields } = convertToIdentifiers(TrustedDevices);

const trustedDevice: TrustedDevice = {
  tenantId: 'tenant-id',
  id: 'trusted-device-id',
  userId: 'user-id',
  secretHash: Buffer.alloc(32, 1),
  userAgent: 'user-agent',
  ip: '127.0.0.1',
  country: 'US',
  city: 'San Francisco',
  createdAt: 1,
  lastUsedAt: 1,
  expiresAt: 2,
};

describe('trusted device queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('inserts a trusted device record once per device ID', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      expect(query).toMatch(/insert into "trusted_devices"/i);
      expect(query).toMatch(/on conflict \("id"\) do nothing/i);
      expect(values).toEqual([
        trustedDevice.id,
        trustedDevice.userId,
        trustedDevice.secretHash,
        trustedDevice.userAgent,
        trustedDevice.ip,
        trustedDevice.country,
        trustedDevice.city,
        trustedDevice.expiresAt,
      ]);

      return createMockQueryResult([trustedDevice]);
    });

    await expect(
      queries.insertIfNotExists({
        id: trustedDevice.id,
        userId: trustedDevice.userId,
        secretHash: trustedDevice.secretHash,
        userAgent: trustedDevice.userAgent ?? undefined,
        ip: trustedDevice.ip ?? undefined,
        country: trustedDevice.country ?? undefined,
        city: trustedDevice.city ?? undefined,
        expiresAt: trustedDevice.expiresAt,
      })
    ).resolves.toEqual(trustedDevice);
  });

  it('returns null when the device ID already exists', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([]));

    await expect(
      queries.insertIfNotExists({
        id: trustedDevice.id,
        userId: trustedDevice.userId,
        secretHash: trustedDevice.secretHash,
        expiresAt: trustedDevice.expiresAt,
      })
    ).resolves.toBeNull();
  });

  it('returns all active devices in reverse creation order', async () => {
    const listSql = sql`
      select ${expandFields(TrustedDevices)}
      from ${table}
      where ${fields.userId} = $1
        and ${fields.expiresAt} > now()
      order by ${fields.createdAt} desc
    `;

    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(query, listSql.sql);
      expect(values).toEqual([trustedDevice.userId]);
      return createMockQueryResult([trustedDevice]);
    });

    await expect(queries.findActiveByUserId(trustedDevice.userId)).resolves.toEqual([
      trustedDevice,
    ]);
  });

  it('constrains active point lookup by record and user ownership', async () => {
    const expectSql = sql`
      select ${expandFields(TrustedDevices)}
      from ${table}
      where ${fields.id} = $1
        and ${fields.userId} = $2
        and ${fields.expiresAt} > now()
    `;

    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(query, expectSql.sql);
      expect(values).toEqual([trustedDevice.id, trustedDevice.userId]);
      return createMockQueryResult([trustedDevice]);
    });

    await expect(
      queries.findActiveByIdAndUserId(trustedDevice.id, trustedDevice.userId)
    ).resolves.toEqual(trustedDevice);
  });

  it('updates active-device metadata without overwriting missing values and replaces a supplied location pair', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(123_000);

    const expectSql = sql`
      update ${table}
      set ${fields.lastUsedAt}=to_timestamp($1::double precision / 1000), ${fields.userAgent}=$2, ${fields.country}=$3, ${fields.city}=$4
      where ${fields.id} = $5
        and ${fields.userId} = $6
        and ${fields.expiresAt} > now()
      returning ${expandFields(TrustedDevices)}
    `;

    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(query, expectSql.sql);
      expect(values).toEqual([
        123_000,
        'new-user-agent',
        'CA',
        null,
        trustedDevice.id,
        trustedDevice.userId,
      ]);
      return createMockQueryResult([trustedDevice]);
    });

    await expect(
      queries.updateMetadataByIdAndUserId(trustedDevice.id, trustedDevice.userId, {
        userAgent: 'new-user-agent',
        country: 'CA',
      })
    ).resolves.toEqual(trustedDevice);
  });

  it('preserves the existing location when request metadata has no location', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(123_000);

    const expectSql = sql`
      update ${table}
      set ${fields.lastUsedAt}=to_timestamp($1::double precision / 1000), ${fields.userAgent}=$2
      where ${fields.id} = $3
        and ${fields.userId} = $4
        and ${fields.expiresAt} > now()
      returning ${expandFields(TrustedDevices)}
    `;

    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(query, expectSql.sql);
      expect(values).toEqual([123_000, 'new-user-agent', trustedDevice.id, trustedDevice.userId]);
      return createMockQueryResult([trustedDevice]);
    });

    await expect(
      queries.updateMetadataByIdAndUserId(trustedDevice.id, trustedDevice.userId, {
        userAgent: 'new-user-agent',
      })
    ).resolves.toEqual(trustedDevice);
  });

  it('returns null when metadata cannot be updated for an inactive or missing device', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      expect(query).toMatch(/and "expires_at" > now\(\)/i);
      expect(query).not.toMatch(/"last_used_at" < to_timestamp/i);
      expect(values).toEqual([expect.any(Number), trustedDevice.id, trustedDevice.userId]);
      return createMockQueryResult([]);
    });

    await expect(
      queries.updateMetadataByIdAndUserId(trustedDevice.id, trustedDevice.userId, {})
    ).resolves.toBeNull();
  });

  it('deletes a record only when both its ID and owner match', async () => {
    const expectSql = sql`
      delete from ${table}
      where ${fields.id} = $1
        and ${fields.userId} = $2
      returning ${expandFields(TrustedDevices)}
    `;

    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(query, expectSql.sql);
      expect(values).toEqual([trustedDevice.id, trustedDevice.userId]);
      return createMockQueryResult([trustedDevice]);
    });

    await expect(
      queries.deleteByIdAndUserId(trustedDevice.id, trustedDevice.userId)
    ).resolves.toEqual(trustedDevice);
  });

  it('deletes every RLS-visible row for the current tenant', async () => {
    const expectSql = sql`
      delete from ${table}
    `;

    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(query, expectSql.sql);
      expect(values).toEqual([]);
      return createMockQueryResult([trustedDevice]);
    });

    await expect(queries.deleteAllByTenant()).resolves.toBe(1);
  });

  it('allows concurrent tenant cleanup calls to remain idempotent', async () => {
    const expectSql = sql`
      delete from ${table}
      where ${fields.expiresAt} <= now()
    `;

    mockQuery
      .mockImplementationOnce(async (query, values) => {
        expectSqlAssert(query, expectSql.sql);
        expect(values).toEqual([]);
        return createMockQueryResult([trustedDevice]);
      })
      .mockImplementationOnce(async (query, values) => {
        expectSqlAssert(query, expectSql.sql);
        expect(values).toEqual([]);
        return createMockQueryResult([]);
      });

    await expect(
      Promise.all([queries.deleteExpiredByTenant(), queries.deleteExpiredByTenant()])
    ).resolves.toEqual([1, 0]);
  });
});
