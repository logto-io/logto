import { MfaFactor, Users } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { mockUser } from '#src/__mocks__/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createUserQueries } = await import('./user.js');
const {
  findUserByUsername,
  findUserByEmail,
  findUserByPhone,
  findUserByIdentity,
  findUserByWebAuthnCredential,
  hasUser,
  hasUserWithId,
  hasUserWithEmail,
  hasUserWithIdentity,
  hasUserWithPhone,
  updateUserById,
  updateUserTotpMfaVerificationLastUsed,
  deleteUserById,
  deleteUserIdentity,
} = createUserQueries(pool);

describe('user query', () => {
  const { table, fields } = convertToIdentifiers(Users);
  const databaseValue = {
    ...mockUser,
    profile: JSON.stringify({}),
    identities: JSON.stringify(mockUser.identities),
    customData: JSON.stringify(mockUser.customData),
    logtoConfig: JSON.stringify(mockUser.logtoConfig),
    mfaVerifications: JSON.stringify(mockUser.mfaVerifications),
  };

  it('findUserByUsername', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.username}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.username]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByUsername(mockUser.username!, true)).resolves.toEqual(databaseValue);
  });

  it('findUserByUsername (case insensitive)', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where lower(${fields.username})=lower($1)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.username]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByUsername(mockUser.username!, false)).resolves.toEqual(databaseValue);
  });

  it('findUserByEmail', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where lower(${fields.primaryEmail})=lower($1)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryEmail]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByEmail(mockUser.primaryEmail!)).resolves.toEqual(databaseValue);
  });

  it('findUserByPhone', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.primaryPhone}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryPhone]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByPhone(mockUser.primaryPhone!)).resolves.toEqual(databaseValue);
  });

  it('findUserByIdentity', async () => {
    const target = 'github';

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = $1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.id]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByIdentity(target, mockUser.id)).resolves.toEqual(databaseValue);
  });

  it('findUserByWebAuthnCredential', async () => {
    const credentialId = 'credential-id';

    const expectSql = sql`
      select ${sql.join(
        Object.values(fields).map((field) => sql`${table}.${field}`),
        sql`,`
      )}
      from ${table}
      where ${fields.mfaVerifications}::jsonb @> ${sql.jsonb([
        {
          type: MfaFactor.WebAuthn,
          credentialId,
        },
      ])}
      limit 1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        JSON.stringify([
          {
            type: MfaFactor.WebAuthn,
            credentialId,
          },
        ]),
      ]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByWebAuthnCredential(credentialId)).resolves.toEqual(databaseValue);
  });

  it('findUserByWebAuthnCredential (with rpId)', async () => {
    const credentialId = 'credential-id';
    const rpId = 'example.com';

    const expectSql = sql`
      select ${sql.join(
        Object.values(fields).map((field) => sql`${table}.${field}`),
        sql`,`
      )}
      from ${table}
      where ${fields.mfaVerifications}::jsonb @> ${sql.jsonb([
        {
          type: MfaFactor.WebAuthn,
          credentialId,
          rpId,
        },
      ])}
      limit 1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        JSON.stringify([
          {
            type: MfaFactor.WebAuthn,
            credentialId,
            rpId,
          },
        ]),
      ]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(findUserByWebAuthnCredential(credentialId, rpId)).resolves.toEqual(databaseValue);
  });

  it('hasUser', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where ${fields.username}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.username]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUser(mockUser.username!, true)).resolves.toEqual(true);
  });

  it('hasUser (case insensitive)', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where lower(${fields.username})=lower($1)
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.username]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUser(mockUser.username!, false)).resolves.toEqual(true);
  });

  it('hasUserWithId', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where ${fields.id}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.id]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUserWithId(mockUser.id)).resolves.toEqual(true);
  });

  it('hasUserWithEmail', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.primaryEmail}
        from ${table}
        where lower(${fields.primaryEmail})=lower($1)
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryEmail]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUserWithEmail(mockUser.primaryEmail!)).resolves.toEqual(true);
  });

  it('hasUserWithPhone', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.primaryPhone}
        from ${table}
        where ${fields.primaryPhone}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.primaryPhone]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUserWithPhone(mockUser.primaryPhone!)).resolves.toEqual(true);
  });

  it('hasUserWithIdentity', async () => {
    const target = 'github';

    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = $1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockUser.id]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasUserWithIdentity(target, mockUser.id)).resolves.toEqual(true);
  });

  it('updateUserById', async () => {
    const username = 'Joe';
    const id = 'foo';
    const expectSql = sql`
      update ${table}
      set ${fields.username}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([username, id]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(updateUserById(id, { username })).resolves.toEqual(databaseValue);
  });

  it('updateUserTotpMfaVerificationLastUsed', async () => {
    const id = 'foo';
    const mfaVerificationId = 'totp-id';
    const usedTimeStep = 100;
    const lastUsedAt = '2024-01-01T00:00:00.000Z';
    const expectSql = sql`
      update ${table}
      set ${fields.mfaVerifications} = (
        select jsonb_agg(
          case
            when item->>'id' = $1 and item->>'type' = $2
              then item || jsonb_build_object(
                'lastUsedAt', $3,
                'lastUsedTimeStep', $4
              )
            else item
          end
          order by ordinal
        )
        from jsonb_array_elements(${fields.mfaVerifications}::jsonb) with ordinality as mfa(item, ordinal)
      )
      where ${fields.id} = $5
        and exists (
          select 1
          from jsonb_array_elements(${fields.mfaVerifications}::jsonb) as mfa(item)
          where item->>'id' = $6
            and item->>'type' = $7
            and (
              not (item ? 'lastUsedTimeStep')
              or case
                when jsonb_typeof(item->'lastUsedTimeStep') = 'number'
                  then (item->>'lastUsedTimeStep')::numeric < $8
                else false
              end
            )
        )
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([
        mfaVerificationId,
        MfaFactor.TOTP,
        lastUsedAt,
        usedTimeStep,
        id,
        mfaVerificationId,
        MfaFactor.TOTP,
        usedTimeStep,
      ]);

      return createMockQueryResult([databaseValue]);
    });

    await expect(
      updateUserTotpMfaVerificationLastUsed(id, mfaVerificationId, usedTimeStep, lastUsedAt)
    ).resolves.toEqual(databaseValue);
  });

  it('deleteUserById', async () => {
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([databaseValue]);
    });

    await deleteUserById(id);
  });

  it('deleteUserById should throw with zero response', async () => {
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([]);
    });

    await expect(deleteUserById(id)).rejects.toMatchError(new DeletionError(Users.table, id));
  });

  it('deleteUserIdentity', async () => {
    const userId = 'foo';
    const target = 'connector1';

    const { connector1, ...restIdentities } = mockUser.identities;
    const finalDbvalue = {
      ...mockUser,
      profile: JSON.stringify({}),
      identities: JSON.stringify(restIdentities),
      customData: JSON.stringify(mockUser.customData),
      logtoConfig: JSON.stringify(mockUser.logtoConfig),
      mfaVerifications: JSON.stringify(mockUser.mfaVerifications),
    };

    const expectSql = sql`
      update ${table}
      set ${fields.identities}=${fields.identities}::jsonb-$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([target, mockUser.id]);

      return createMockQueryResult([finalDbvalue]);
    });

    await expect(deleteUserIdentity(userId, target)).resolves.toEqual(finalDbvalue);
  });
});
