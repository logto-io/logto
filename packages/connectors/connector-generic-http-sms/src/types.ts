import { z } from 'zod';

export const requiredTemplateUsageTypes = [
  'Register',
  'SignIn',
  'ForgotPassword',
  'OrganizationInvitation',
  'UserPermissionValidation',
  'BindNewIdentifier',
  'Generic',
  'OTP',
] as const;
export const usageTypeEnum = z.enum(requiredTemplateUsageTypes);

const templateGuard = z.object({
  usageType: usageTypeEnum,
  content: z.string(),
});

const simpleValue = z.union([z.string(), z.number(), z.boolean()]);

export const httpSmsConfigGuard = z.object({
  endpoint: z.string().url(),
  method: z.enum(['GET', 'POST']),
  authorization: z.string().optional(),
  queryParams: z.record(z.string(), simpleValue).optional(),
  bodyParams: z.record(z.string(), simpleValue).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  templates: z
    .array(templateGuard)
    .optional()
    .default([
      { usageType: 'Register', content: 'Register code: {{message}}' },
      { usageType: 'SignIn', content: 'Sign in code: {{message}}' },
      { usageType: 'ForgotPassword', content: 'Reset code: {{message}}' },
      { usageType: 'Generic', content: '{{message}}' },
      { usageType: 'OTP', content: '{{message}}' },
    ]),
});

export type HttpSmsConfig = z.infer<typeof httpSmsConfigGuard>;
export type Template = z.infer<typeof templateGuard>;
export type UsageType = z.infer<typeof usageTypeEnum>;
