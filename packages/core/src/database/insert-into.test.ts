import type { CreateUser } from '@logto/schemas';
import { Users } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import decamelize from 'decamelize';

import envSet from '#src/env-set/index.js';
import { InsertionError } from '#src/errors/SlonikError/index.js';
import { createTestPool } from '#src/utils/test-utils.js';

import { buildInsertInto } from './insert-into.js';

const { jest } = import.meta;
const poolSpy = jest.spyOn(envSet, 'pool', 'get');

const buildExpectedInsertIntoSql = (keys: string[]) => [
  // eslint-disable-next-line sql/no-unsafe-query
  `insert into "users" (${keys.map((key) => `"${decamelize(key)}"`).join(', ')})`,
  `values (${keys.map((_, index) => `$${index + 1}`).join(', ')})`,
];

describe('buildInsertInto()', () => {
  it('resolves a promise with `undefined` when `returning` is false', async () => {
    const user: CreateUser = { id: 'foo', username: '456', applicationId: 'bar' };
    const expectInsertIntoSql = buildExpectedInsertIntoSql(Object.keys(user));
    const pool = createTestPool(expectInsertIntoSql.join('\n'));
    poolSpy.mockReturnValue(pool);

    const insertInto = buildInsertInto(Users);
    await expect(insertInto(user)).resolves.toBe(undefined);
  });

  it('resolves a promise with `undefined` when `returning` is false and `onConflict` is enabled', async () => {
    const user: CreateUser = {
      id: 'foo',
      username: '456',
      primaryEmail: 'foo@bar.com',
      applicationId: 'bar',
    };
    const expectInsertIntoSql = buildExpectedInsertIntoSql(Object.keys(user));
    const pool = createTestPool(
      [
        ...expectInsertIntoSql,
        'on conflict ("id", "username") do update',
        'set "primary_email"=excluded."primary_email"',
      ].join('\n')
    );
    poolSpy.mockReturnValue(pool);

    const { fields } = convertToIdentifiers(Users);
    const insertInto = buildInsertInto(Users, {
      onConflict: {
        fields: [fields.id, fields.username],
        setExcludedFields: [fields.primaryEmail],
      },
    });
    await expect(insertInto(user)).resolves.toBe(undefined);
  });

  it('resolves a promise with single entity when `returning` is true', async () => {
    const user: CreateUser = {
      id: 'foo',
      username: '123',
      primaryEmail: 'foo@bar.com',
      applicationId: 'bar',
    };
    const expectInsertIntoSql = buildExpectedInsertIntoSql(Object.keys(user));
    const pool = createTestPool(
      [...expectInsertIntoSql, 'returning *'].join('\n'),
      (_, [id, username, primaryEmail, applicationId]) => ({
        id: String(id),
        username: String(username),
        primaryEmail: String(primaryEmail),
        applicationId: String(applicationId),
      })
    );
    poolSpy.mockReturnValue(pool);

    const insertInto = buildInsertInto(Users, { returning: true });
    await expect(
      insertInto({ id: 'foo', username: '123', primaryEmail: 'foo@bar.com', applicationId: 'bar' })
    ).resolves.toStrictEqual(user);
  });

  it('throws `InsertionError` error when `returning` is true', async () => {
    const user: CreateUser = {
      id: 'foo',
      username: '123',
      primaryEmail: 'foo@bar.com',
      applicationId: 'bar',
    };
    const expectInsertIntoSql = buildExpectedInsertIntoSql(Object.keys(user));
    const pool = createTestPool([...expectInsertIntoSql, 'returning *'].join('\n'));
    poolSpy.mockReturnValue(pool);

    const insertInto = buildInsertInto(Users, { returning: true });
    const dataToInsert = {
      id: 'foo',
      username: '123',
      primaryEmail: 'foo@bar.com',
      applicationId: 'bar',
    };

    await expect(insertInto(dataToInsert)).rejects.toMatchError(
      new InsertionError(Users, dataToInsert)
    );
  });
});
