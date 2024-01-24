import { z } from 'zod';

import { cloudflareDataGuard, domainDnsRecordsGuard, domainStatusGuard } from './custom-domain.js';

export const customDomainGuard = z.object({
  /* The domain name, e.g app.example.com */
  domain: z.string(),
  /* The status of the domain in Cloudflare */
  status: domainStatusGuard,
  /* The error message if any */
  errorMessage: z.string().nullable(),
  /* The DNS records of the domain */
  dnsRecords: domainDnsRecordsGuard,
  /* The remote Cloudflare data */
  cloudflareData: cloudflareDataGuard.nullable(),
});

export const customDomainsGuard = z.array(customDomainGuard);

export type CustomDomain = z.infer<typeof customDomainGuard>;

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
  /* Custom domain */
  customDomains: customDomainsGuard.optional(),
});

export type ProtectedAppMetadata = z.infer<typeof protectedAppMetadataGuard>;
