import { createMockPool, createMockQueryResult } from '@silverhand/slonik';

import type { QueryType } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();
const pool = createMockPool({
  query: async (sql, values) => mockQuery(sql, values),
});

const { OidcSessionExtensionsQueries } = await import('./oidc-session-extensions.js');
const queries = new OidcSessionExtensionsQueries(pool);

// Under RLS only leakproof predicates can be index conditions, and `->>` is not.
const expectPayloadColumnLookups = (statement: string) => {
  expect(statement).toContain('on "payload_uid" = "session_uid"');
  expect(statement).toContain('"payload_account_id" = $');
  expect(statement).not.toMatch(/"payload" ->> '(accountId|uid)' =/);
};

describe('OidcSessionExtensionsQueries', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('finds active sessions by the account id column', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expectPayloadColumnLookups(statement);
      expect(statement).toContain('"payload",');
      expect(values).toEqual(['user-id', 'Session', 'user-id', expect.any(Number)]);

      return createMockQueryResult([]);
    });

    await expect(queries.findUserActiveSessionsWithExtensions('user-id')).resolves.toEqual([]);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('finds one active session by the account id and uid columns', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      const statement = String(query);

      expectPayloadColumnLookups(statement);
      expect(statement).toContain('"payload_uid" = $');
      expect(values).toEqual(['user-id', 'Session', 'user-id', 'session-uid', expect.any(Number)]);

      return createMockQueryResult([]);
    });

    await expect(
      queries.findUserActiveSessionWithExtension('user-id', 'session-uid')
    ).resolves.toBeNull();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});
