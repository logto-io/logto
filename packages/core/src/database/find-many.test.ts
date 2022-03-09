import { Users } from '@logto/schemas';

import { createTestPool } from '@/utils/test-utils';

import { buildFindMany } from './find-many';

describe('buildFindMany()', () => {
  it('matches expected sql', async () => {
    const pool = createTestPool(
      'select "id", "username", "primary_email", "primary_phone", "password_encrypted", "password_encryption_method", "password_encryption_salt", "name", "avatar", "role_names", "identities", "custom_data"\nfrom "users"'
    );
    const findMany = buildFindMany(pool, Users);
    await findMany();
  });

  it('matches expected sql with where conditions', async () => {
    const pool = createTestPool(
      'select "id", "username", "primary_email", "primary_phone", "password_encrypted", "password_encryption_method", "password_encryption_salt", "name", "avatar", "role_names", "identities", "custom_data"\nfrom "users"\nwhere "id"=$1'
    );
    const findMany = buildFindMany(pool, Users);
    await findMany({ where: { id: '123' } });
  });

  it('matches expected sql with orderBy', async () => {
    const pool = createTestPool(
      'select "id", "username", "primary_email", "primary_phone", "password_encrypted", "password_encryption_method", "password_encryption_salt", "name", "avatar", "role_names", "identities", "custom_data"\nfrom "users"\norder by "id" asc, "username" desc'
    );
    const findMany = buildFindMany(pool, Users);
    await findMany({ orderBy: { id: 'asc', username: 'desc' } });
  });

  it('matches expected sql with limit', async () => {
    const pool = createTestPool(
      'select "id", "username", "primary_email", "primary_phone", "password_encrypted", "password_encryption_method", "password_encryption_salt", "name", "avatar", "role_names", "identities", "custom_data"\nfrom "users"\nlimit $1'
    );
    const findMany = buildFindMany(pool, Users);
    await findMany({ limit: 10 });
  });

  it('matches expected sql with offset', async () => {
    const pool = createTestPool(
      'select "id", "username", "primary_email", "primary_phone", "password_encrypted", "password_encryption_method", "password_encryption_salt", "name", "avatar", "role_names", "identities", "custom_data"\nfrom "users"\noffset $1'
    );
    const findMany = buildFindMany(pool, Users);
    await findMany({ offset: 10 });
  });

  it('matches expected sql with offset 0', async () => {
    const pool = createTestPool(
      'select "id", "username", "primary_email", "primary_phone", "password_encrypted", "password_encryption_method", "password_encryption_salt", "name", "avatar", "role_names", "identities", "custom_data"\nfrom "users"'
    );
    const findMany = buildFindMany(pool, Users);
    await findMany({ offset: 0 });
  });

  it('matches expected sql with where conditions, orderBy, limit, and offset', async () => {
    const pool = createTestPool(
      'select "id", "username", "primary_email", "primary_phone", "password_encrypted", "password_encryption_method", "password_encryption_salt", "name", "avatar", "role_names", "identities", "custom_data"\nfrom "users"\nwhere "id"=$1\norder by "id" desc, "username" asc\nlimit $2\noffset $3'
    );
    const findMany = buildFindMany(pool, Users);
    await findMany({
      where: { id: '123' },
      orderBy: { id: 'desc', username: 'asc' },
      limit: 20,
      offset: 20,
    });
  });
});
