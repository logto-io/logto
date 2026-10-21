/**
 * Test double for `@/consts/env`.
 *
 * The real module reads `import.meta.env`, which Jest cannot parse, so a test that pulls in a
 * module depending on it must replace it:
 *
 * ```ts
 * import { mockEnv, resetMockEnv } from '@/test-utils/env';
 *
 * jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
 *
 * beforeEach(resetMockEnv);
 *
 * it('...', () => {
 *   mockEnv({ isDevFeaturesEnabled: true });
 * });
 * ```
 *
 * The factory must go through `jest.requireActual`, since `jest.mock` is hoisted above the imports.
 * `mockEnvModule` reads its values through getters, so `mockEnv` calls made after the code under
 * test has imported the module still take effect.
 */

type MockableEnv = {
  isProduction: boolean;
  isCloud: boolean;
  isDevFeaturesEnabled: boolean;
  ossSurveyEndpoint: string | undefined;
};

/** Outside Cloud, not production, dev features off. */
const defaults: Readonly<MockableEnv> = Object.freeze({
  isProduction: false,
  isCloud: false,
  isDevFeaturesEnabled: false,
  ossSurveyEndpoint: undefined,
});

// eslint-disable-next-line @silverhand/fp/no-let -- the mocked module reads the current values through getters
let state: MockableEnv = { ...defaults };

/** Overrides the given values; the others keep their current value. */
export const mockEnv = (values: Partial<MockableEnv>) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- see `state`
  state = { ...state, ...values };
};

/** Restores the defaults. */
export const resetMockEnv = () => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- see `state`
  state = { ...defaults };
};

/**
 * The module to pass to `jest.mock('@/consts/env', ...)`. Only reachable through
 * `jest.requireActual` in the factory, since `jest.mock` is hoisted above the imports.
 */
// eslint-disable-next-line import/no-unused-modules -- consumed through `jest.requireActual`
export const mockEnvModule = Object.freeze({
  get isProduction() {
    return state.isProduction;
  },
  get isCloud() {
    return state.isCloud;
  },
  get isDevFeaturesEnabled() {
    return state.isDevFeaturesEnabled;
  },
  get ossSurveyEndpoint() {
    return state.ossSurveyEndpoint;
  },
});

/** The type of this module, for the `jest.requireActual` call in the `jest.mock` factory. */
export type EnvTestUtils = {
  mockEnv: typeof mockEnv;
  resetMockEnv: typeof resetMockEnv;
  mockEnvModule: typeof mockEnvModule;
};
