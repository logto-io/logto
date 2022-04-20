import { CreateLog, Logs } from '@logto/schemas';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';

export const insertLog = buildInsertInto<CreateLog>(pool, Logs);
