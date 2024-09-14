import {
  oidcClientMetadataGuard,
  applicationCreateGuard as originalApplicationCreateGuard,
  applicationPatchGuard as originalApplicationPatchGuard,
} from '@logto/schemas';
import { z } from 'zod';

export const applicationCreateGuard = originalApplicationCreateGuard
  .omit({
    protectedAppMetadata: true,
    oidcClientMetadata: true,
  })
  .extend({
    protectedAppMetadata: z
      .object({
        subDomain: z.string(),
        origin: z.string(),
      })
      .optional(),
    // Prevent setting grantTypes and responseTypes in the create guard
    oidcClientMetadata: oidcClientMetadataGuard
      .omit({
        grantTypes: true,
        responseTypes: true,
      })
      .optional(),
  });

export const applicationPatchGuard = originalApplicationPatchGuard
  .omit({
    protectedAppMetadata: true,
    oidcClientMetadata: true,
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
    // Prevent setting grantTypes and responseTypes in the create guard
    oidcClientMetadata: oidcClientMetadataGuard
      .omit({
        grantTypes: true,
        responseTypes: true,
      })
      .optional(),
  });
