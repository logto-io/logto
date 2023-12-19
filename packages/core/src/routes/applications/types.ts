import {
  Applications,
  applicationCreateGuard as originalApplicationCreateGuard,
} from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

enum OriginalApplicationType {
  Native = 'Native',
  SPA = 'SPA',
  Traditional = 'Traditional',
  MachineToMachine = 'MachineToMachine',
}

// FIXME:  @simeng-li Remove this guard once Logto as IdP is ready
// FIXME:  @wangsijie Remove this guard once protected app is ready
// @ts-expect-error -- hide the dev feature field from the guard type, but always return the full type to make the api logic simpler
export const applicationResponseGuard: typeof Applications.guard = EnvSet.values
  .isDevFeaturesEnabled
  ? Applications.guard
  : Applications.guard
      .omit({ isThirdParty: true, type: true })
      .extend({ type: z.nativeEnum(OriginalApplicationType) });

// @ts-expect-error -- hide the dev feature field from the guard type, but always return the full type to make the api logic simpler
export const applicationCreateGuard: typeof originalApplicationCreateGuard = EnvSet.values
  .isDevFeaturesEnabled
  ? originalApplicationCreateGuard
  : originalApplicationCreateGuard
      .omit({ isThirdParty: true, type: true })
      .extend({ type: z.nativeEnum(OriginalApplicationType) });
