import { EnvSet } from '#src/env-set/index.js';

/** FOR TEST PURPOSE ONLY, DON'T USE IN PROD. */
export const envSetForTest = new EnvSet();

await envSetForTest.load();
