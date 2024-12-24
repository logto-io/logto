import { z } from 'zod';

const templateGuard = z.object({
  usageType: z.string(),
  content: z.string(),
});

export const yunpianSmsConfigGuard = z.object({
  apikey: z.string(),
  templates: z
    .array(templateGuard)
    .refine(
      (templates) =>
        ['Register', 'SignIn', 'ForgotPassword', 'Generic'].every((type) =>
          templates.map((template) => template.usageType).includes(type)
        ),
      {
        message:
          'Must provide all required template types (Register/SignIn/ForgotPassword/Generic)',
      }
    ),
  enableInternational: z.boolean().optional(),
  unsupportedCountriesMsg: z.string().optional(),
});

export type YunpianSmsConfig = z.infer<typeof yunpianSmsConfigGuard>;

export type YunpianSmsPayload = {
  apikey: string;
  mobile: string;
  text: string;
};

export type YunpianSmsResponse = {
  code: number;
  msg: string;
  count: number;
  fee: number;
  unit: string;
  mobile: string;
  sid: number;
};

export const yunpianSmsResponseGuard = z.object({
  code: z.number(),
  msg: z.string(),
  count: z.number(),
  fee: z.number(),
  unit: z.string(),
  mobile: z.string(),
  sid: z.number(),
});

export type YunpianErrorResponse = {
  http_status_code: number;
  code: number;
  msg: string;
  detail?: string;
};

export const yunpianErrorResponseGuard = z.object({
  http_status_code: z.number(),
  code: z.number(),
  msg: z.string(),
  detail: z.string().optional(),
});
