import { z } from 'zod';

export enum CaptchaType {
  RecaptchaEnterprise = 'RecaptchaEnterprise',
  Turnstile = 'Turnstile',
}

export const turnstileConfigGuard = z.object({
  type: z.literal(CaptchaType.Turnstile),
  siteKey: z.string(),
  secretKey: z.string(),
});

export const recaptchaEnterpriseConfigGuard = z.object({
  type: z.literal(CaptchaType.RecaptchaEnterprise),
  siteKey: z.string(),
  secretKey: z.string(),
  projectId: z.string(),
});

export const captchaConfigGuard = z.discriminatedUnion('type', [
  turnstileConfigGuard,
  recaptchaEnterpriseConfigGuard,
]);

export type CaptchaConfig = z.infer<typeof captchaConfigGuard>;
