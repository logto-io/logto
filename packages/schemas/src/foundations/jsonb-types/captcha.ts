import { z } from 'zod';

export enum CaptchaType {
  RecaptchaEnterprise = 'RecaptchaEnterprise',
  Turnstile = 'Turnstile',
  Cap = 'Cap',
}

export enum RecaptchaEnterpriseMode {
  Invisible = 'invisible',
  Checkbox = 'checkbox',
}

export const turnstileConfigGuard = z.object({
  type: z.literal(CaptchaType.Turnstile),
  siteKey: z.string(),
  secretKey: z.string(),
});

export type TurnstileConfig = z.infer<typeof turnstileConfigGuard>;

export const recaptchaEnterpriseConfigGuard = z.object({
  type: z.literal(CaptchaType.RecaptchaEnterprise),
  siteKey: z.string(),
  secretKey: z.string(),
  projectId: z.string(),
  domain: z.string().optional(),
  mode: z.nativeEnum(RecaptchaEnterpriseMode).optional(),
});

export type RecaptchaEnterpriseConfig = z.infer<typeof recaptchaEnterpriseConfigGuard>;

/**
 * Config of a self-hosted Cap Standalone instance.
 *
 * @see https://capjs.js.org/guide/standalone/
 */
export const capConfigGuard = z.object({
  type: z.literal(CaptchaType.Cap),
  /** The public base URL of the Cap Standalone instance, e.g. `https://cap.example.com`. */
  endpoint: z
    .string()
    .url()
    .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
      message: 'The endpoint must be an HTTP(S) URL.',
    }),
  siteKey: z.string(),
  secretKey: z.string(),
});

export type CapConfig = z.infer<typeof capConfigGuard>;

export const captchaConfigGuard = z.discriminatedUnion('type', [
  turnstileConfigGuard,
  recaptchaEnterpriseConfigGuard,
  capConfigGuard,
]);

export type CaptchaConfig = z.infer<typeof captchaConfigGuard>;
