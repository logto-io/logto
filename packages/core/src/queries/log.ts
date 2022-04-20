import { CreateLog, Logs } from '@logto/schemas';

import { buildInsertInto } from '@/database/insert-into';

export const insertLog = buildInsertInto<CreateLog>(Logs);
