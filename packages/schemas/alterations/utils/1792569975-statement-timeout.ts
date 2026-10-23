import { type DatabasePool, type DatabasePoolConnection, sql } from '@silverhand/slonik';

/**
 * Runs `step` on one pinned connection with `statement_timeout` disabled, for a single statement
 * that outlives the pool's timeout, such as `create index concurrently`. `reset` restores the
 * pool's configured timeout, which is sent as a connection startup parameter, before the
 * connection is released; a failed step's connection is discarded by the pool, so no reset is
 * needed then. Inside `up`, use `set local statement_timeout = 0` on the transaction instead.
 */
export const withoutStatementTimeout = async (
  pool: DatabasePool,
  step: (connection: DatabasePoolConnection) => Promise<void>
) =>
  pool.connect(async (connection) => {
    await connection.query(sql`set statement_timeout = 0`);
    await step(connection);
    await connection.query(sql`reset statement_timeout`);
  });
