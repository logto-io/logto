import { MessageTypes } from '@logto/connector-kit';
import { Passcodes } from '@logto/schemas';
import { convertToIdentifiers, convertToPrimitiveOrSql, excludeAutoSetFields } from '@logto/shared';
import { createMockPool, createMockQueryResult, sql } from 'slonik';
import { snakeCase } from 'snake-case';

import { mockPasscode } from '#src/__mocks__/index.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

import {
  findUnconsumedPasscodeByJtiAndType,
  findUnconsumedPasscodesByJtiAndType,
  insertPasscode,
  deletePasscodeById,
  deletePasscodesByIds,
} from './passcode.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

describe('passcode query', () => {
  const { table, fields } = convertToIdentifiers(Passcodes);

  it('findUnconsumedPasscodeByJtiAndType', async () => {
    const jti = 'foo';
    const type = MessageTypes.SignIn;

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.interactionJti}=$1 and ${fields.type}=$2 and ${fields.consumed} = false
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([jti, type]);

      return createMockQueryResult([mockPasscode]);
    });

    await expect(findUnconsumedPasscodeByJtiAndType(jti, type)).resolves.toEqual(mockPasscode);
  });

  it('findUnconsumedPasscodesByJtiAndType', async () => {
    const jti = 'foo';
    const type = MessageTypes.SignIn;

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.interactionJti}=$1 and ${fields.type}=$2 and ${fields.consumed} = false
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([jti, type]);

      return createMockQueryResult([mockPasscode]);
    });

    await expect(findUnconsumedPasscodesByJtiAndType(jti, type)).resolves.toEqual([mockPasscode]);
  });

  it('insertPasscode', async () => {
    const keys = excludeAutoSetFields(Passcodes.fieldKeys);

    const expectSql = `
      insert into "passcodes" (${keys.map((k) => `"${snakeCase(k)}"`).join(', ')})
      values (${keys.map((_, index) => `$${index + 1}`).join(', ')})
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual(keys.map((k) => convertToPrimitiveOrSql(k, mockPasscode[k])));

      return createMockQueryResult([mockPasscode]);
    });

    await expect(insertPasscode(mockPasscode)).resolves.toEqual(mockPasscode);
  });

  it('deletePasscodeById', async () => {
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockPasscode]);
    });

    await deletePasscodeById(id);
  });

  it('deletePasscodeById throw error if return row count is 0', async () => {
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

    await expect(deletePasscodeById(id)).rejects.toMatchError(
      new DeletionError(Passcodes.table, id)
    );
  });

  it('deletePasscodesByIds', async () => {
    const ids = ['foo', 'foo2'];
    const expectSql = sql`
      delete from ${table}
      where ${fields.id} in (${sql.join(ids, sql`,`)})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(ids);

      return createMockQueryResult([mockPasscode, mockPasscode]);
    });

    await deletePasscodesByIds(ids);
  });

  it('deletePasscodesByIds throw error if return row count not match requested id length', async () => {
    const ids = ['foo', 'foo2'];
    const expectSql = sql`
      delete from ${table}
      where ${fields.id} in (${sql.join(ids, sql`,`)})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(ids);

      return createMockQueryResult([mockPasscode]);
    });

    await expect(deletePasscodesByIds(ids)).rejects.toMatchError(
      new DeletionError(Passcodes.table, `${ids.join(',')}`)
    );
  });
});
