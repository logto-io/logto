import { defaultTenantId } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

export const mockEnvSet = new EnvSet(defaultTenantId, EnvSet.values.dbUrl);

await mockEnvSet.load();
