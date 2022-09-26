import { DatabaseTransactionConnection } from 'slonik';
import { z } from 'zod';

export const migrationStateGuard = z.object({
  timestamp: z.number(),
  updatedAt: z.string().optional(),
});

export type MigrationState = z.infer<typeof migrationStateGuard>;

export type MigrationScript = {
  up: (connection: DatabaseTransactionConnection) => Promise<void>;
  down: (connection: DatabaseTransactionConnection) => Promise<void>;
};
