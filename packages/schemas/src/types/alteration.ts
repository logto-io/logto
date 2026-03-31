import type { CommonQueryMethods, DatabaseTransactionConnection } from '@silverhand/slonik';

/**
 * IMPORTANT: Logto Cloud has a parallel `AlterationScript` type in `@logto/cloud-alterations`
 * (logto-cloud repo: `packages/cloud-alterations/src/types.ts`).
 * Any changes to this type must be synchronized with the Cloud type definition.
 */
export type AlterationScript = {
  /**
   * Optional hook that runs before `up` outside of a transaction.
   * Use for operations that cannot be wrapped in a transaction (e.g., CREATE INDEX CONCURRENTLY).
   */
  beforeUp?: (connection: CommonQueryMethods) => Promise<void>;
  /**
   * Optional hook that runs before `down` outside of a transaction.
   * Use for operations that cannot be wrapped in a transaction (e.g., DROP INDEX CONCURRENTLY).
   */
  beforeDown?: (connection: CommonQueryMethods) => Promise<void>;
  up: (connection: DatabaseTransactionConnection) => Promise<void>;
  down: (connection: DatabaseTransactionConnection) => Promise<void>;
};
