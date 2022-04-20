import { createPool } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

import envSet from '@/env-set';

const interceptors = [...createInterceptors()];

const pool = createPool(envSet.values.dbUrl, { interceptors });

export default pool;
