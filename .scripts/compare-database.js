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
    order by indexname asc;
  `);

  const { rows: funcs } = await pool.query(/* sql */`
    select n.nspname as schema_name,
      p.proname as specific_name,
      case p.prokind 
        when 'f' then 'FUNCTION'
        when 'p' then 'PROCEDURE'
        when 'a' then 'AGGREGATE'
        when 'w' then 'WINDOW'
        end as kind,
      l.lanname as language,
      case when l.lanname = 'internal' then p.prosrc
        else pg_get_functiondef(p.oid)
        end as definition,
      pg_get_function_arguments(p.oid) as arguments,
      t.typname as return_type
    from pg_proc p
    left join pg_namespace n on p.pronamespace = n.oid
    left join pg_language l on p.prolang = l.oid
    left join pg_type t on t.oid = p.prorettype 
    where n.nspname not in ('pg_catalog', 'information_schema')
    and l.lanname != 'c' -- Filter out c functions since we don't use them
    order by schema_name, specific_name;
  `);

  const { rows: triggers } = await pool.query(/* sql */`select * from information_schema.triggers;`);

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
    funcs,
    triggers: omitArray(triggers, 'trigger_catalog', 'event_object_catalog'),
  };
};

const [,, database1, database2] = process.argv;

console.log('Compare database manifest between', database1, 'and', database2);

const manifests = [
  await queryDatabaseManifest(database1),
  await queryDatabaseManifest(database2),
];

assert.deepStrictEqual(...manifests);

const queryDatabaseData = async (database) => {
  const pool = new pg.Pool({ database, user: 'postgres', password: 'postgres' });
  const result = await Promise.all(manifests[0].tables
    // system configs are usually generated or time-relative, ignore for now
    .filter(({ table_name }) => !['logto_configs', '_logto_configs', 'systems'].includes(table_name))
    .map(async ({ table_name }) => {
      const { rows } = await pool.query(/* sql */`select * from ${table_name};`);

      return [table_name, omitArray(rows, 'created_at', 'updated_at', 'secret', 'db_user', 'db_user_password')];
    })
  );

  return Object.fromEntries(result);
};

console.log('Compare database data between', database1, 'and', database2);

assert.deepStrictEqual(
  await queryDatabaseData(database1),
  await queryDatabaseData(database2),
);
