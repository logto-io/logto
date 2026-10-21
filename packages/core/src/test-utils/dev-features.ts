import { EnvSet } from '#src/env-set/index.js';

/**
 * The value loaded from the environment when this test file started. Core unit tests run with
 * `NODE_ENV=test`, where dev features are enabled by default, so tests that need the disabled
 * behavior must override the flag at runtime.
 */
const initialIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

/**
 * Overrides the process-wide dev-feature flag for the current test file.
 *
 * `EnvSet.values` is shared by every module in a test file, so restore the previous value in
 * `afterEach` or `afterAll`. Use {@link resetDevFeaturesEnabled} to return to the value loaded
 * from the environment.
 */
export const setDevFeaturesEnabled = (enabled: boolean) => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', enabled);
};

/** Restores the dev-feature flag captured when this test file started. */
export const resetDevFeaturesEnabled = () => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', initialIsDevFeaturesEnabled);
};
