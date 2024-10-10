import { z } from 'zod';

export const ssoDomainsGuard = z.array(z.string());

export type SsoDomains = z.infer<typeof ssoDomainsGuard>;

export const ssoBrandingGuard = z.object({
  displayName: z.string().optional(),
  logo: z.string().optional(),
  darkLogo: z.string().optional(),
});

export type SsoBranding = z.infer<typeof ssoBrandingGuard>;

export const idpInitiatedAuthParamsGuard = z
  .object({
    resources: z.array(z.string()).optional(),
    scopes: z.array(z.string()).optional(),
  })
  .catchall(z.unknown());

export type IdpInitiatedAuthParams = z.infer<typeof idpInitiatedAuthParamsGuard>;

export const ssoSamlAssertionContentGuard = z
  .object({
    nameID: z.string().optional(),
    attributes: z.record(z.string().or(z.array(z.string()))).optional(),
    conditions: z
      .object({
        notBefore: z.string(),
        notOnOrAfter: z.string(),
      })
      .optional(),
  })
  .catchall(z.unknown());

export type SsoSamlAssertionContent = z.infer<typeof ssoSamlAssertionContentGuard>;
