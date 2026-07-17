import { z } from 'zod';

export enum DomainVerificationFileContentType {
  Text = 'text/plain',
  Json = 'application/json',
}

export const domainVerificationFilePathGuard = z
  .string()
  .min(1)
  .max(256)
  .refine(
    (value) =>
      /^\/[\w-][\w.-]*\.[\w-][\w.-]*$/.test(value) ||
      /^\/\.well-known(?:\/[\w-][\w.-]*)+$/.test(value),
    'The path must point to a file with an extension at the domain root or to a path under /.well-known/.'
  );

export const domainVerificationFileGuard = z
  .object({
    path: domainVerificationFilePathGuard,
    content: z
      .string()
      .min(1)
      .max(16 * 1024),
    contentType: z.nativeEnum(DomainVerificationFileContentType),
  })
  .superRefine(({ content, contentType }, context) => {
    if (contentType !== DomainVerificationFileContentType.Json) {
      return;
    }

    try {
      JSON.parse(content);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The content must be valid JSON for the application/json content type.',
        path: ['content'],
      });
    }
  });

export type DomainVerificationFile = z.infer<typeof domainVerificationFileGuard>;

export const domainVerificationFilesGuard = domainVerificationFileGuard
  .array()
  .max(10)
  .superRefine((files, context) => {
    const paths = new Set<string>();

    for (const [index, file] of files.entries()) {
      if (paths.has(file.path)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Verification file paths must be unique.',
          path: [index, 'path'],
        });
      }

      paths.add(file.path);
    }
  });

export type DomainVerificationFiles = z.infer<typeof domainVerificationFilesGuard>;

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
