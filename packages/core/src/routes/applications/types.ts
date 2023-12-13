import {
  Applications,
  applicationCreateGuard as originalApplicationCreateGuard,
} from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

// FIXME:  @simeng-li Remove this guard once Logto as IdP is ready
// @ts-expect-error -- hide the dev feature field from the guard type, but always return the full type to make the api logic simpler
export const applicationResponseGuard: typeof Applications.guard = EnvSet.values
  .isDevFeaturesEnabled
  ? Applications.guard
  : Applications.guard.omit({ isThirdParty: true });

// @ts-expect-error -- hide the dev feature field from the guard type, but always return the full type to make the api logic simpler
export const applicationCreateGuard: typeof originalApplicationCreateGuard = EnvSet.values
  .isDevFeaturesEnabled
  ? originalApplicationCreateGuard
  : originalApplicationCreateGuard.omit({ isThirdParty: true });
