import { z } from 'zod';

export const ssoDomainsGuard = z.array(z.string());

export type SsoDomains = z.infer<typeof ssoDomainsGuard>;

export const ssoBrandingGuard = z.object({
  logto: z.string().optional(),
  darkLogo: z.string().optional(),
});

export type SsoBranding = z.infer<typeof ssoBrandingGuard>;
