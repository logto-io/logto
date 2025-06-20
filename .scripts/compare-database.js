import pg from 'pg';
import assert from 'node:assert';

const omit = (object, ...keys) =>
  Object.fromEntries(
    Object.entries(object).filter(([key]) => !keys.includes(key))
  );
const omitArray = (arrayOfObjects, ...keys) =>
  arrayOfObjects.map((value) => omit(value, ...keys));

// Function to normalize function/trigger definitions by stripping whitespace from each line
export const normalizeDefinition = (definition) => {
  if (typeof definition !== 'string') {
    return definition;
  }
  
  return definition
    .split('\n')
    .map(line => line.trim())
    .join('\n');
};

const schemas = ['cloud', 'public'];
const schemasArray = `(${schemas.map((schema) => `'${schema}'`).join(', ')})`;

const tryCompare = (a, b) => {
  try {
    assert.deepStrictEqual(a, b);
  } catch (error) {
    console.error(error.toString());
    process.exit(1);
  }
};

const queryDatabaseManifest = async (database) => {
  const pool = new pg.Pool({
    database,
    user: 'postgres',
    password: 'postgres',
  });

  const { rows: tables } = await pool.query(/* sql */ `
    select *
    from information_schema.tables
    where table_schema in ${schemasArray}
    order by table_schema, table_name asc;
  `);

  const { rows: columns } = await pool.query(/* sql */ `
    select *
    from information_schema.columns 
    where table_schema in ${schemasArray}
    order by table_schema, table_name, column_name asc;
  `);

  const { rows: enums } = await pool.query(/* sql */ `
    select pg_type.typname, pg_enum.enumlabel
    from pg_type 
    join pg_enum 
    on pg_enum.enumtypid = pg_type.oid
    order by pg_type.typname, pg_enum.enumlabel asc;
  `);

  const { rows: constraints } = await pool.query(/* sql */ `
    select conrelid::regclass as r_table, con.*, pg_get_constraintdef(con.oid) as def
    from pg_catalog.pg_constraint con
    inner join pg_catalog.pg_class rel
    on rel.oid = con.conrelid
    inner join pg_catalog.pg_namespace nsp
    on nsp.oid = connamespace
    where nsp.nspname = 'public'
    order by conname asc, def asc, conrelid::regclass asc;
  `);

  const { rows: indexes } = await pool.query(/* sql */ `
    select *
    from pg_indexes
    where schemaname in ${schemasArray}
    order by schemaname, indexname asc;
  `);

  const { rows: funcs } = await pool.query(/* sql */ `
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

  const { rows: triggers } = await pool.query(
    /* sql */ `select * from information_schema.triggers;`
  );
  const { rows: policies } = await pool.query(
    /* sql */ `select * from pg_policies order by tablename, policyname;`
  );
  const { rows: columnGrants } = await pool.query(/* sql */ `
    select * from information_schema.role_column_grants
    where table_schema in ${schemasArray}
      and grantee != 'postgres'
    order by table_schema, grantee, table_name, column_name, privilege_type;
  `);
  const { rows: tableGrants } = await pool.query(/* sql */ `
    select * from information_schema.role_table_grants
    where table_schema in ${schemasArray}
      and grantee != 'postgres'
    order by table_schema, grantee, table_name, privilege_type;
  `);

  // This function removes the last segment of grantee since Logto will use 'logto_tenant_fresh/alteration' for the role name.
  const normalizeRoleName = (roleName) => {
    if (roleName.startsWith('logto_tenant_')) {
      return 'logto_tenant';
    }

    // Removes the last segment of region grantee since Logto will use 'logto_region_xxx' for the role name for different regions.
    if (roleName.startsWith('logto_region_')) {
      return 'logto_region';
    }

    return roleName;
  };

  const normalizeGrantee = ({ grantee, ...rest }) => ({
    ...rest,
    grantee: normalizeRoleName(grantee),
  });

  // Ditto.
  const normalizeRoles = ({ roles: raw, ...rest }) => {
    const roles = raw
      .slice(1, -1)
      .split(',')
      .map((name) => normalizeRoleName(name));

    return { roles, ...rest };
  };

  const normalizePolicyname = ({ policyname, ...rest }) => {
    const prefix = 'allow_';
    const suffix = '_access';
    if (
      policyname &&
      policyname.startsWith(prefix) &&
      policyname.endsWith(suffix)
    ) {
      // This is a naming convention in Logto cloud, it is formatted as `allow_{role_name}_access`, we need to normalize the role name part for the convenience of comparing DB updates.
      // Ref: https://github.com/logto-io/cloud/pull/738
      return {
        policyname: `${prefix}${normalizeRoleName(
          policyname.slice(prefix.length, -suffix.length)
        )}${suffix}`,
        ...rest,
      };
    }

    return { policyname, ...rest };
  };

  // Normalize function definitions by stripping whitespace from each line
  const normalizeFuncDefinition = ({ definition, ...rest }) => ({
    ...rest,
    definition: normalizeDefinition(definition),
  });

  // Normalize trigger action statements by stripping whitespace from each line
  const normalizeTriggerAction = ({ action_statement, ...rest }) => ({
    ...rest,
    action_statement: normalizeDefinition(action_statement),
  });

  // Omit generated ids and values
  return {
    tables: omitArray(tables, 'table_catalog'),
    columns: omitArray(
      columns,
      'table_catalog',
      'udt_catalog',
      'ordinal_position',
      'dtd_identifier'
    ),
    enums,
    constraints: omitArray(
      constraints,
      'oid',
      /**
       * See https://www.postgresql.org/docs/current/catalog-pg-constraint.html, better to use `pg_get_constraintdef()`
       * to extract the definition of check constraint, so this can be omitted since conbin changes with the status of the computing resources.
       */
      'conbin',
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
      'conexclop'
    ),
    indexes,
    funcs: funcs.map(normalizeFuncDefinition),
    triggers: omitArray(triggers, 'trigger_catalog', 'event_object_catalog').map(normalizeTriggerAction),
    policies: policies.map(normalizeRoles).map(normalizePolicyname),
    columnGrants: omitArray(columnGrants, 'table_catalog').map(
      normalizeGrantee
    ),
    tableGrants: omitArray(tableGrants, 'table_catalog').map(normalizeGrantee),
  };
};

// Export utility functions first
export const autoCompare = (a, b) => {
  if (typeof a !== typeof b) {
    return (typeof a).localeCompare(typeof b);
  }

  if (typeof a === 'object' && a !== null && b !== null) {
    const aKeys = Object.keys(a).sort();
    const bKeys = Object.keys(b).sort();

    for (let i = 0; i < Math.min(aKeys.length, bKeys.length); i++) {
      if (aKeys[i] !== bKeys[i]) {
        return aKeys[i].localeCompare(bKeys[i]);
      }
      const comparison = autoCompare(a[aKeys[i]], b[bKeys[i]]);
      if (comparison !== 0) {
        return comparison;
      }
    }

    return aKeys.length - bKeys.length;
  }

  return String(a).localeCompare(String(b));
};

// Function to evaluate the complexity of a value
// Higher values indicate more complex types that should be compared first
export const getValueComplexity = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'boolean') return 1;
  if (typeof value === 'number') return 2;
  if (typeof value === 'string') return 3;
  if (Array.isArray(value)) return 4;
  if (typeof value === 'object') return 5;
  return 0;
};

export const buildSortByKeys = (keys) => (a, b) => {
  // Sort keys based on value complexity and then find the first differing key
  const sortedKeys = keys.slice().sort((keyA, keyB) => {
    const complexityA = Math.max(getValueComplexity(a[keyA]), getValueComplexity(b[keyA]));
    const complexityB = Math.max(getValueComplexity(a[keyB]), getValueComplexity(b[keyB]));
    
    // Sort by complexity descending (more complex first), then by key name ascending
    if (complexityA !== complexityB) {
      return complexityB - complexityA;
    }
    return keyA.localeCompare(keyB);
  });
  
  // Use deep comparison instead of reference comparison for objects
  const found = sortedKeys.find((key) => {
    const comparison = autoCompare(a[key], b[key]);
    return comparison !== 0;
  });
  return found ? autoCompare(a[found], b[found]) : 0;
};

const queryDatabaseData = async (database, manifests) => {
  const pool = new pg.Pool({
    database,
    user: 'postgres',
    password: 'postgres',
  });

  const result = await Promise.all(
    manifests[0].tables.map(async ({ table_schema, table_name }) => {
      const { rows } = await pool.query(
        /* sql */ `select * from ${table_schema}.${table_name};`
      );

      // check config rows except the value column
      if (['logto_configs', '_logto_configs', 'systems'].includes(table_name)) {
        const data = omitArray(rows, 'value');
        return [
          table_name,
          data.sort(buildSortByKeys(Object.keys(data[0] ?? {}))),
        ];
      }

      const data = omitArray(
        rows,
        'id',
        'resource_id',
        'role_id',
        'application_id',
        'scope_id',
        'created_at',
        'updated_at',
        'secret',
        'db_user',
        'db_user_password',
        'add_on_sku_id'
      );

      return [table_name, data.sort(buildSortByKeys(Object.keys(data[0] ?? {})))];
    })
  );

  return Object.fromEntries(result);
};

// Main execution logic - only runs when file is executed directly
const isMainModule = import.meta.url === new URL(process.argv[1], 'file://').href;

if (isMainModule) {
  const [, , database1, database2] = process.argv;

  console.log('Compare database manifest between', database1, 'and', database2);

  const manifests = [
    await queryDatabaseManifest(database1),
    await queryDatabaseManifest(database2),
  ];

  tryCompare(...manifests);

  console.log('Compare database data between', database1, 'and', database2);

  tryCompare(
    await queryDatabaseData(database1, manifests),
    await queryDatabaseData(database2, manifests)
  );
}
