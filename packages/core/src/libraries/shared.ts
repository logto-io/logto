import envSet from '#src/env-set/index.js';
import Queries from '#src/tenants/Queries.js';

/** @deprecated Don't use. This is for transition only and will be removed soon. */
export const defaultQueries = new Queries(envSet.pool);
