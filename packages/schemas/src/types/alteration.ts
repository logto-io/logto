import type { DatabaseTransactionConnection } from 'slonik';
import { z } from 'zod';

export const alterationStateGuard = z.object({
  timestamp: z.number(),
  updatedAt: z.string().optional(),
});

export type AlterationState = z.infer<typeof alterationStateGuard>;

export type AlterationScript = {
  up: (connection: DatabaseTransactionConnection) => Promise<void>;
  down: (connection: DatabaseTransactionConnection) => Promise<void>;
};
