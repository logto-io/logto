import { z } from 'zod';

export const protectedAppMetadataGuard = z.object({
  /* The host of the site */
  host: z.string(),
  /* The origin of the site */
  origin: z.string(),
  /* Session duration in seconds */
  sessionDuration: z.number(),
  pageRules: z.array(
    z.object({
      /* The path pattern (regex) to match */
      path: z.string(),
    })
  ),
});

export type ProtectedAppMetadata = z.infer<typeof protectedAppMetadataGuard>;
