import { DatabasePool } from 'slonik';
import { z } from 'zod';

export const databaseVersionGuard = z.object({
  version: z.string(),
  updatedAt: z.string().optional(),
});

export type DatabaseVersion = z.infer<typeof databaseVersionGuard>;

export type MigrationScript = {
  up: (pool: DatabasePool) => Promise<void>;
  down: (pool: DatabasePool) => Promise<void>;
};
