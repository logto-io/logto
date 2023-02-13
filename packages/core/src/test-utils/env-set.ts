import { EnvSet } from '#src/env-set/index.js';

export const mockEnvSet = new EnvSet(EnvSet.values.dbUrl);

await mockEnvSet.load();
