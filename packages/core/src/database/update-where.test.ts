import type { CreateUser, User } from '@logto/schemas';
import { Users, Applications } from '@logto/schemas';
import type { UpdateWhereData } from '@logto/shared';

import { UpdateError } from '#src/errors/SlonikError/index.js';
import { createTestPool } from '#src/utils/test-utils.js';

const { buildUpdateWhereWithPool } = await import('./update-where.js');

describe('buildUpdateWhere()', () => {
  it('resolves a promise with `undefined` when `returning` is false', async () => {
    const pool = createTestPool(
      'update "users"\nset "username"=$1\nwhere "id"=$2 and "username"=$3'
    );

    const updateWhere = buildUpdateWhereWithPool(pool)(Users);
    await expect(
      updateWhere({
        set: { username: '123' },
        where: { id: 'foo', username: '456' },
        jsonbMode: 'merge',
      })
    ).resolves.toBe(undefined);
  });

  it('resolves a promise with single entity when `returning` is true', async () => {
    const user: CreateUser = {
      id: 'foo',
      username: '123',
      primaryEmail: 'foo@bar.com',
      applicationId: 'bar',
    };
    const pool = createTestPool(
      'update "users"\nset "username"=$1, "primary_email"=$2, "application_id"=$3\nwhere "id"=$4\nreturning *',
      (_, [username, primaryEmail, applicationId, id]) => ({
        id: String(id),
        username: String(username),
        primaryEmail: String(primaryEmail),
        applicationId: String(applicationId),
      })
    );

    const updateWhere = buildUpdateWhereWithPool(pool)(Users, true);
    await expect(
      updateWhere({
        set: { username: '123', primaryEmail: 'foo@bar.com', applicationId: 'bar' },
        where: { id: 'foo' },
        jsonbMode: 'merge',
      })
    ).resolves.toStrictEqual(user);
  });

  it('return query with jsonb partial update if input data type is jsonb', async () => {
    const pool = createTestPool(
      'update "applications"\nset\n"custom_client_metadata"=\ncoalesce("custom_client_metadata",\'{}\'::jsonb) || $1\nwhere "id"=$2\nreturning *',
      (_, [customClientMetadata, id]) => ({
        id: String(id),
        customClientMetadata: String(customClientMetadata),
      })
    );

    const updateWhere = buildUpdateWhereWithPool(pool)(Applications, true);
    await expect(
      updateWhere({
        set: { customClientMetadata: { idTokenTtl: 3600 } },
        where: { id: 'foo' },
        jsonbMode: 'merge',
      })
    ).resolves.toStrictEqual({ id: 'foo', customClientMetadata: '{"idTokenTtl":3600}' });
  });

  it('throws an error when `undefined` found in values', async () => {
    const pool = createTestPool(
      'update "users"\nset "username"=$1\nwhere "id"=$2 and "username"=$3'
    );

    const updateWhere = buildUpdateWhereWithPool(pool)(Users);

    await expect(
      updateWhere({
        set: { username: '123', id: undefined },
        where: { id: 'foo', username: '456' },
        jsonbMode: 'merge',
      })
    ).rejects.toMatchError(new Error(`Cannot convert id to primitive`));
  });

  it('throws `entity.not_exists_with_id` error with `undefined` when `returning` is true', async () => {
    const pool = createTestPool('update "users"\nset "username"=$1\nwhere "id"=$2\nreturning *');

    const updateWhere = buildUpdateWhereWithPool(pool)(Users, true);
    const updateWhereData: UpdateWhereData<User> = {
      set: { username: '123' },
      where: { id: 'foo' },
      jsonbMode: 'merge',
    };

    await expect(updateWhere(updateWhereData)).rejects.toMatchError(
      new UpdateError(Users, updateWhereData)
    );
  });

  it('throws `UpdateError` error when `returning` is true and no id in where clause', async () => {
    const pool = createTestPool(
      'update "users"\nset "username"=$1\nwhere "username"=$2\nreturning *'
    );

    const updateWhere = buildUpdateWhereWithPool(pool)(Users, true);
    const updateWhereData: UpdateWhereData<User> = {
      set: { username: '123' },
      where: { username: 'foo' },
      jsonbMode: 'merge',
    };

    await expect(updateWhere(updateWhereData)).rejects.toMatchError(
      new UpdateError(Users, updateWhereData)
    );
  });
});
