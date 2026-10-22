import { assert, type Nullable } from '@silverhand/essentials';
import { sql, type DatabasePool, type SqlSqlToken } from '@silverhand/slonik';

/**
 * Explains `statement` as the tenant's database role, so row-level security applies and only
 * leakproof predicates can become index conditions. The pool's user must be allowed to `set role`
 * to that role. Sequential and bitmap scans are turned off so the tiny integration tables still
 * yield a plain index scan whose `Index Cond` and `Filter` lines show which clauses the planner
 * may use.
 *
 * The assertions below match lines anywhere in the plan, so a statement under test should scan
 * the table once, or assert on a column that only the scan in question can carry.
 */
export const explainAsTenant = async (
  pool: DatabasePool,
  tenantId: string,
  statement: SqlSqlToken
): Promise<readonly string[]> =>
  pool.transaction(async (transaction) => {
    const { dbUser } = await transaction.one<{ dbUser: Nullable<string> }>(sql`
      select db_user as "dbUser" from tenants where id = ${tenantId}
    `);

    assert(dbUser, new Error(`Tenant ${tenantId} has no database role to explain as`));

    await transaction.query(sql`set local role ${sql.identifier([dbUser])}`);
    assert(
      await transaction.oneFirst<boolean>(sql`select row_security_active('tenants')`),
      new Error(`Role ${dbUser} bypasses row-level security, so its plans prove nothing`)
    );
    await transaction.query(sql`set local enable_seqscan = off`);
    await transaction.query(sql`set local enable_bitmapscan = off`);

    return transaction.anyFirst<string>(sql`explain (costs off) ${statement}`);
  });

// In non-verbose output a column reference prints unqualified as `(id = …)` or, with a cast,
// `((id)::text = …)`; anchoring on the opening parenthesis keeps `id` from matching `tenant_id`.
const matchesColumn = (line: string, column: string | RegExp) =>
  typeof column === 'string'
    ? new RegExp(String.raw`\(${column}[\s)]`).test(line)
    : column.test(line);

const hasPlanNode = (plan: readonly string[], nodePrefix: string, column: string | RegExp) =>
  plan.some((line) => line.trimStart().startsWith(nodePrefix) && matchesColumn(line, column));

const describePlan = (plan: readonly string[]) => `\n\nPlan:\n${plan.join('\n')}`;

/**
 * Asserts the planner seeks by `column` (a column name, or a pattern for an expression): it
 * appears on an `Index Cond` line of the plan.
 */
export const expectIndexCondition = (plan: readonly string[], column: string | RegExp) => {
  assert(
    hasPlanNode(plan, 'Index Cond:', column),
    new Error(`Expected ${String(column)} in an Index Cond.${describePlan(plan)}`)
  );
};

/** Asserts `column` is not used to seek: it appears on no `Index Cond` line of the plan. */
export const expectNoIndexCondition = (plan: readonly string[], column: string | RegExp) => {
  assert(
    !hasPlanNode(plan, 'Index Cond:', column),
    new Error(`Expected ${String(column)} in no Index Cond.${describePlan(plan)}`)
  );
};

/**
 * Asserts `column` is only checked after the scan: it appears on a `Filter` line, which means
 * every fetched row is tested against it instead of being found through an index.
 */
export const expectFilter = (plan: readonly string[], column: string | RegExp) => {
  assert(
    hasPlanNode(plan, 'Filter:', column),
    new Error(`Expected ${String(column)} in a Filter.${describePlan(plan)}`)
  );
};
