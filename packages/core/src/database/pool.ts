import { createPool } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';
import { getEnv } from '@/utils/env';

const interceptors = [...createInterceptors()];

const pool = createPool(getEnv('DB_URL'), { interceptors });

export default pool;
