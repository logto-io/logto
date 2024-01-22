import { z } from 'zod';

export const domainDnsRecordGuard = z.object({
  name: z.string(),
  type: z.string(),
  value: z.string(),
});
export type DomainDnsRecord = z.infer<typeof domainDnsRecordGuard>;
export const domainDnsRecordsGuard = domainDnsRecordGuard.array();
export type DomainDnsRecords = z.infer<typeof domainDnsRecordsGuard>;

// https://developers.cloudflare.com/api/operations/custom-hostname-for-a-zone-list-custom-hostnames#Responses
// Predefine the "useful" fields
export const cloudflareDataGuard = z.object({
  id: z.string(),
  status: z.string(),
  ssl: z.object({
    status: z.string(),
    validation_errors: z
      .object({
        message: z.string(),
      })
      .array()
      .optional(),
  }),
  verification_errors: z.string().array().optional(),
});

export type CloudflareData = z.infer<typeof cloudflareDataGuard>;

export enum DomainStatus {
  PendingVerification = 'PendingVerification',
  PendingSsl = 'PendingSsl',
  Active = 'Active',
  Error = 'Error',
}

export const domainStatusGuard = z.nativeEnum(DomainStatus);
