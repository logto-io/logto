import { createQueryClient } from '@withtyped/postgres';

import { EnvSet } from '#src/env-set/index.js';
import { parseDsn } from '#src/utils/postgres.js';

export const client = createQueryClient(parseDsn(EnvSet.global.dbUrl));
