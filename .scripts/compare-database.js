import pg from 'pg';
import assert from 'node:assert';

const omit = (object, ...keys) => Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
const omitArray = (arrayOfObjects, ...keys) => arrayOfObjects.map((value) => omit(value, ...keys));

const schema = 'public';

const queryDatabaseManifest = async (database) => {
  const pool = new pg.Pool({ database, user: 'postgres', password: 'postgres' });

  const { rows: tables } = await pool.query(/* sql */`
    select *
    from information_schema.tables
    where table_schema = '${schema}'
    order by table_name asc;
  `);

  const { rows: columns } = await pool.query(/* sql */`
    select *
    from information_schema.columns 
    where table_schema = '${schema}' 
    order by table_name, column_name asc;
  `);

  const { rows: enums } = await pool.query(/* sql */`
    select pg_type.typname, pg_enum.enumlabel
    from pg_type 
    join pg_enum 
    on pg_enum.enumtypid = pg_type.oid
    order by pg_type.typname, pg_enum.enumlabel asc;
  `);

  const { rows: constraints } = await pool.query(/* sql */`
    select conrelid::regclass AS table, con.*, pg_get_constraintdef(con.oid)
    from pg_catalog.pg_constraint con
    inner join pg_catalog.pg_class rel
    on rel.oid = con.conrelid
    inner join pg_catalog.pg_namespace nsp
    on nsp.oid = connamespace
    where nsp.nspname = 'public'
    order by conname asc;
  `);

  const { rows: indexes } = await pool.query(/* sql */`
    select *
    from pg_indexes
    where schemaname='${schema}'
    order by tablename, indexname asc;
  `);

  // Omit generated ids and values
  return {
    tables: omitArray(tables, 'table_catalog'),
    columns: omitArray(columns, 'table_catalog', 'udt_catalog', 'ordinal_position', 'dtd_identifier'),
    enums,
    constraints: omitArray(
      constraints,
      'oid',
      'connamespace',
      'conrelid',
      'contypid',
      'conindid',
      'conparentid',
      'confrelid',
      'conkey',
      'confkey',
      'conpfeqop',
      'conppeqop',
      'conffeqop',
      'confdelsetcols',
      'conexclop',
    ),
    indexes,
  };
};

const [,, database1, database2] = process.argv;

console.log('Compare database manifest between', database1, 'and', database2)

assert.deepStrictEqual(
  await queryDatabaseManifest(database1),
  await queryDatabaseManifest(database2),
);
