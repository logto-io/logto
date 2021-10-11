import { UserDBEntry, Users } from '@logto/schemas';

import RequestError from '@/errors/RequestError';
import { createTestPool } from '@/utils/test-utils';

import { buildUpdateWhere } from './update-where';

describe('buildUpdateWhere()', () => {
  it('resolves a promise with `undefined` when `returning` is false', async () => {
    const pool = createTestPool(
      'update "users"\nset "username"=$1\nwhere "id"=$2 and "username"=$3'
    );
    const updateWhere = buildUpdateWhere(pool, Users);
    await expect(
      updateWhere({
        set: { username: '123', id: undefined },
        where: { id: 'foo', username: '456' },
      })
    ).resolves.toBe(undefined);
  });

  it('resolves a promise with single entity when `returning` is true', async () => {
    const user: UserDBEntry = { id: 'foo', username: '123', primaryEmail: 'foo@bar.com' };
    const pool = createTestPool(
      'update "users"\nset "username"=$1, "primary_email"=$2\nwhere "id"=$3\nreturning *',
      (_, [username, primaryEmail, id]) => ({
        id: String(id),
        username: String(username),
        primaryEmail: String(primaryEmail),
      })
    );
    const updateWhere = buildUpdateWhere(pool, Users, true);
    await expect(
      updateWhere({ set: { username: '123', primaryEmail: 'foo@bar.com' }, where: { id: 'foo' } })
    ).resolves.toStrictEqual(user);
  });

  it('throws `entity.not_exists_with_id` error with `undefined` when `returning` is true', async () => {
    const pool = createTestPool('update "users"\nset "username"=$1\nwhere "id"=$2\nreturning *');
    const updateWhere = buildUpdateWhere(pool, Users, true);

    await expect(
      updateWhere({ set: { username: '123' }, where: { id: 'foo' } })
    ).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_exists_with_id',
        name: Users.tableSingular,
        id: 'foo',
        status: 404,
      })
    );
  });

  it('throws `entity.not_exists` error with `undefined` when `returning` is true and no id in where clause', async () => {
    const pool = createTestPool(
      'update "users"\nset "username"=$1\nwhere "username"=$2\nreturning *'
    );
    const updateWhere = buildUpdateWhere(pool, Users, true);

    await expect(
      updateWhere({ set: { username: '123' }, where: { username: 'foo' } })
    ).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_exists',
        name: Users.tableSingular,
        id: undefined,
        status: 404,
      })
    );
  });
});
