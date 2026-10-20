import { z } from 'zod';

export const ssoDomainsGuard = z.array(z.string());

export type SsoDomains = z.infer<typeof ssoDomainsGuard>;

export const ssoBrandingGuard = z.object({
  displayName: z.string().optional(),
  logo: z.string().optional(),
  darkLogo: z.string().optional(),
  /**
   * Whether to expose the display name and logos in the public sign-in experience before an email
   * domain matches. Defaults to `true` when omitted.
   */
  showBeforeEmailMatch: z.boolean().optional(),
});

export type SsoBranding = z.infer<typeof ssoBrandingGuard>;

export const idpInitiatedAuthParamsGuard = z
  .object({
    scope: z.string().optional(),
  })
  .catchall(z.string());

export type IdpInitiatedAuthParams = z.infer<typeof idpInitiatedAuthParamsGuard>;

export const ssoSamlAssertionContentGuard = z
  .object({
    nameID: z.string().optional(),
    attributes: z.record(z.string().or(z.array(z.string()))).optional(),
    conditions: z
      .object({
        notBefore: z.string().optional(),
        notOnOrAfter: z.string().optional(),
      })
      .optional(),
  })
  .catchall(z.unknown());

export type SsoSamlAssertionContent = z.infer<typeof ssoSamlAssertionContentGuard>;
