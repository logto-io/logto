import { getEnv } from '@silverhand/essentials';
import { createPool } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

const interceptors = [...createInterceptors()];

const pool = createPool(getEnv('DB_URL'), { interceptors });

export default pool;
