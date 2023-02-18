import { createQueryClient } from '@withtyped/postgres';

import { parseDsn } from '#src/utils/postgres.js';

export const client = createQueryClient(parseDsn(process.env.DB_URL));
