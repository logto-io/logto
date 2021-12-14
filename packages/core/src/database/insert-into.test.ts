import { UserDBEntry, Users } from '@logto/schemas';
import decamelize from 'decamelize';

import RequestError from '@/errors/RequestError';
import { createTestPool } from '@/utils/test-utils';

import { buildInsertInto } from './insert-into';
import { convertToIdentifiers, excludeAutoSetFields } from './utils';

describe('buildInsertInto()', () => {
  const keys = excludeAutoSetFields(Users.fieldKeys);
  const expectInsertIntoSql = [
    `insert into "users" (${keys.map((key) => `"${decamelize(key)}"`).join(', ')})`,
    `values (${keys.map((_, index) => `$${index + 1}`).join(', ')})`,
  ];

  it('resolves a promise with `undefined` when `returning` is false', async () => {
    const pool = createTestPool(expectInsertIntoSql.join('\n'));
    const insertInto = buildInsertInto(pool, Users);
    await expect(insertInto({ id: 'foo', username: '456' })).resolves.toBe(undefined);
  });

  it('resolves a promise with `undefined` when `returning` is false and `onConflict` is enabled', async () => {
    const pool = createTestPool(
      [
        ...expectInsertIntoSql,
        'on conflict ("id", "username") do update',
        'set "primary_email"=excluded."primary_email"',
      ].join('\n')
    );
    const { fields } = convertToIdentifiers(Users);
    const insertInto = buildInsertInto(pool, Users, {
      onConflict: {
        fields: [fields.id, fields.username],
        setExcludedFields: [fields.primaryEmail],
      },
    });
    await expect(
      insertInto({ id: 'foo', username: '456', primaryEmail: 'foo@bar.com' })
    ).resolves.toBe(undefined);
  });

  it('resolves a promise with single entity when `returning` is true', async () => {
    const user: UserDBEntry = { id: 'foo', username: '123', primaryEmail: 'foo@bar.com' };
    const pool = createTestPool(
      [...expectInsertIntoSql, 'returning *'].join('\n'),
      (_, [id, username, primaryEmail]) => ({
        id: String(id),
        username: String(username),
        primaryEmail: String(primaryEmail),
      })
    );
    const insertInto = buildInsertInto(pool, Users, { returning: true });
    await expect(
      insertInto({ id: 'foo', username: '123', primaryEmail: 'foo@bar.com' })
    ).resolves.toStrictEqual(user);
  });

  it('throws `entity.create_failed` error with `undefined` when `returning` is true', async () => {
    const pool = createTestPool([...expectInsertIntoSql, 'returning *'].join('\n'));
    const insertInto = buildInsertInto(pool, Users, { returning: true });

    await expect(
      insertInto({ id: 'foo', username: '123', primaryEmail: 'foo@bar.com' })
    ).rejects.toMatchError(
      new RequestError({
        code: 'entity.create_failed',
        name: Users.tableSingular,
      })
    );
  });
});
