import { DatabaseTransactionConnection } from 'slonik';
import { z } from 'zod';

export const databaseVersionGuard = z.object({
  version: z.string(),
  updatedAt: z.string().optional(),
});

export type DatabaseVersion = z.infer<typeof databaseVersionGuard>;

export type MigrationScript = {
  up: (connection: DatabaseTransactionConnection) => Promise<void>;
  down: (connection: DatabaseTransactionConnection) => Promise<void>;
};
