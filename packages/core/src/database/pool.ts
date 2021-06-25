import { createPool } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

const interceptors = [...createInterceptors()];

const pool = createPool('postgres://localhost/logto', { interceptors });

export default pool;
