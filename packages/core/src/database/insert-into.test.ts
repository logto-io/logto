import type { CreateUser } from '@logto/schemas';
import { Users, CustomProfileFields, CustomProfileFieldType } from '@logto/schemas';
import decamelize from 'decamelize';

import { InsertionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';
import { createTestPool } from '#src/utils/test-utils.js';

const { buildInsertIntoWithPool, buildBatchInsertIntoWithPool } = await import('./insert-into.js');

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

    const insertInto = buildInsertIntoWithPool(pool)(Users);
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

    const { fields } = convertToIdentifiers(Users);
    const insertInto = buildInsertIntoWithPool(pool)(Users, {
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

    const insertInto = buildInsertIntoWithPool(pool)(Users, { returning: true });
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

    const insertInto = buildInsertIntoWithPool(pool)(Users, { returning: true });
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

describe('buildBatchInsertIntoWithPool()', () => {
  it('resolves returning rows with unified keys', async () => {
    const expectSql = [
      'insert into "custom_profile_fields" ("id", "name", "type", "label")',
      'values ($1, $2, $3, $4), ($5, $6, $7, $8)',
      'returning *',
    ].join('\n');
    const pool = createTestPool(expectSql, (_, values) => ({ id: String(values[0]) }));
    const batchInsert = buildBatchInsertIntoWithPool(pool)(CustomProfileFields, {
      returning: true,
    });
    await expect(
      batchInsert([
        { id: 'id_1', name: 'field_one', type: CustomProfileFieldType.Text, label: 'L1' },
        { id: 'id_2', name: 'field_two', type: CustomProfileFieldType.Text, label: 'L2' },
      ])
    ).resolves.toEqual([{ id: 'id_1' }]); // CreateTestPool returns only one mocked row
  });

  it('merges keys across rows (optional field appears)', async () => {
    const expectSql = [
      'insert into "custom_profile_fields" ("id", "name", "type", "label", "description")',
      // First row misses description so should render DEFAULT (no placeholder consumed)
      'values ($1, $2, $3, $4, default), ($5, $6, $7, $8, $9)',
      'returning *',
    ].join('\n');
    const pool = createTestPool(expectSql, (_, values) => ({ id: String(values[0]) }));
    const batchInsert = buildBatchInsertIntoWithPool(pool)(CustomProfileFields, {
      returning: true,
    });
    await expect(
      batchInsert([
        { id: 'id_1', name: 'f1', type: CustomProfileFieldType.Text, label: 'L1' },
        {
          id: 'id_2',
          name: 'f2',
          type: CustomProfileFieldType.Text,
          label: 'L2',
          description: 'Desc',
        },
      ])
    ).resolves.toEqual([{ id: 'id_1' }]);
  });

  it('returns empty array when input is empty', async () => {
    const pool = createTestPool();
    const batchInsert = buildBatchInsertIntoWithPool(pool)(CustomProfileFields, {
      returning: true,
    });
    await expect(batchInsert([])).resolves.toEqual([]);
  });

  it('returns undefined when not returning', async () => {
    const expectSql = [
      'insert into "custom_profile_fields" ("id", "name", "type", "label")',
      'values ($1, $2, $3, $4), ($5, $6, $7, $8)',
    ].join('\n');
    const pool = createTestPool(expectSql);
    const batchInsert = buildBatchInsertIntoWithPool(pool)(CustomProfileFields);
    await expect(
      batchInsert([
        { id: 'id_1', name: 'field_one', type: CustomProfileFieldType.Text, label: 'L1' },
        { id: 'id_2', name: 'field_two', type: CustomProfileFieldType.Text, label: 'L2' },
      ])
    ).resolves.toBeUndefined();
  });

  it('uses DEFAULT for missing per-row keys so DB defaults apply', async () => {
    const expectSql = [
      'insert into "custom_profile_fields" ("id", "name", "type", "required", "config")',
      'values ($1, $2, $3, $4, $5), ($6, $7, $8, default, default)',
      'returning *',
    ].join('\n');
    const pool = createTestPool(expectSql, (_, values) => ({ id: String(values[0]) }));
    const batchInsert = buildBatchInsertIntoWithPool(pool)(CustomProfileFields, {
      returning: true,
    });
    await expect(
      batchInsert([
        {
          id: 'id_1',
          name: 'field_one',
          type: CustomProfileFieldType.Text,
          required: true,
          config: { placeholder: 'x' },
        },
        {
          id: 'id_2',
          name: 'field_two',
          type: CustomProfileFieldType.Text,
          // Required & config omitted -> should become DEFAULT
        },
      ])
    ).resolves.toEqual([{ id: 'id_1' }]);
  });

  it('supports onConflict do update (batch)', async () => {
    const { fields } = convertToIdentifiers(CustomProfileFields);
    const expectSql = [
      'insert into "custom_profile_fields" ("id", "name", "type", "label")',
      'values ($1, $2, $3, $4), ($5, $6, $7, $8)',
      'on conflict ("id") do update set "label"=excluded."label"',
      'returning *',
    ].join('\n');
    const pool = createTestPool(expectSql, (_, values) => ({ id: String(values[0]) }));
    const batchInsert = buildBatchInsertIntoWithPool(pool)(CustomProfileFields, {
      returning: true,
      onConflict: {
        fields: [fields.id],
        setExcludedFields: [fields.label],
      },
    });
    await expect(
      batchInsert([
        { id: 'id_1', name: 'n1', type: CustomProfileFieldType.Text, label: 'L1' },
        { id: 'id_2', name: 'n2', type: CustomProfileFieldType.Text, label: 'L2' },
      ])
    ).resolves.toEqual([{ id: 'id_1' }]);
  });

  it('supports onConflict do nothing (batch)', async () => {
    const expectSql = [
      'insert into "custom_profile_fields" ("id", "name", "type", "label")',
      'values ($1, $2, $3, $4), ($5, $6, $7, $8)',
      'on conflict do nothing',
      'returning *',
    ].join('\n');
    const pool = createTestPool(expectSql, (_, values) => ({ id: String(values[0]) }));
    const batchInsert = buildBatchInsertIntoWithPool(pool)(CustomProfileFields, {
      returning: true,
      onConflict: { ignore: true },
    });
    await expect(
      batchInsert([
        { id: 'id_1', name: 'n1', type: CustomProfileFieldType.Text, label: 'L1' },
        { id: 'id_2', name: 'n2', type: CustomProfileFieldType.Text, label: 'L2' },
      ])
    ).resolves.toEqual([{ id: 'id_1' }]);
  });
});
