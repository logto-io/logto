import type { DatabaseTransactionConnection } from '@silverhand/slonik';

export type AlterationScript = {
  up: (connection: DatabaseTransactionConnection) => Promise<void>;
  down: (connection: DatabaseTransactionConnection) => Promise<void>;
};
