import { z } from 'zod';

export const webAuthnRegistrationOptionsGuard = z.object({
  rp: z.object({
    name: z.string(),
    id: z.string().optional(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
  }),
  challenge: z.string(),
  pubKeyCredParams: z.array(
    z.object({
      type: z.literal('public-key'),
      alg: z.number(),
    })
  ),
  timeout: z.number().optional(),
  excludeCredentials: z
    .array(
      z.object({
        type: z.literal('public-key'),
        id: z.string(),
        transports: z
          .array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb']))
          .optional(),
      })
    )
    .optional(),
  authenticatorSelection: z
    .object({
      authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
      requireResidentKey: z.boolean().optional(),
      residentKey: z.enum(['discouraged', 'preferred', 'required']).optional(),
      userVerification: z.enum(['required', 'preferred', 'discouraged']).optional(),
    })
    .optional(),
  attestation: z.enum(['none', 'indirect', 'direct', 'enterprise']).optional(),
  extensions: z
    .object({
      appid: z.string().optional(),
      credProps: z.boolean().optional(),
      hmacCreateSecret: z.boolean().optional(),
    })
    .optional(),
});

export type WebAuthnRegistrationOptions = z.infer<typeof webAuthnRegistrationOptionsGuard>;
