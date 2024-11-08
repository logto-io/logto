import {
  ApplicationType,
  applicationCreateGuard as originalApplicationCreateGuard,
  applicationPatchGuard as originalApplicationPatchGuard,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

export const applicationCreateGuard = originalApplicationCreateGuard
  .omit({
    protectedAppMetadata: true,
    // TODO: @simeng remove this conditional when the feature is enabled
    ...conditional(!EnvSet.values.isDevFeaturesEnabled && { unknownSessionFallbackUri: true }),
  })
  .extend({
    protectedAppMetadata: z
      .object({
        subDomain: z.string(),
        origin: z.string(),
      })
      .optional(),
  });

export const applicationPatchGuard = originalApplicationPatchGuard
  .omit({
    protectedAppMetadata: true,
    // TODO: @simeng remove this conditional when the feature is enabled
    ...conditional(!EnvSet.values.isDevFeaturesEnabled && { unknownSessionFallbackUri: true }),
  })
  .extend({
    protectedAppMetadata: z
      .object({
        origin: z.string().optional(),
        sessionDuration: z.number().optional(),
        pageRules: z
          .array(
            z.object({
              /* The path pattern (regex) to match */
              path: z.string(),
            })
          )
          .optional(),
      })
      .optional(),
  });

export const applicationTypeGuard = z.nativeEnum(ApplicationType);
