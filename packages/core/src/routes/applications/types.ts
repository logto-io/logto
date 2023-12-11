import {
  Applications,
  applicationCreateGuard as originalApplicationCreateGuard,
} from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';

// FIXME:  @simeng-li Remove this guard once Logto as IdP is ready
export const applicationResponseGuard = EnvSet.values.isDevFeaturesEnabled
  ? Applications.guard
  : Applications.guard.omit({ isThirdParty: true });

export const applicationCreateGuard = EnvSet.values.isDevFeaturesEnabled
  ? originalApplicationCreateGuard
  : originalApplicationCreateGuard.omit({ isThirdParty: true });
