import { z } from 'zod';

import { webAuthnTransportGuard } from '../foundations/jsonb-types/index.js';

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
        transports: webAuthnTransportGuard.array().optional(),
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

export const webAuthnAuthenticationOptionsGuard = z.object({
  challenge: z.string(),
  timeout: z.number().optional(),
  rpId: z.string().optional(),
  allowCredentials: z
    .array(
      z.object({
        type: z.literal('public-key'),
        id: z.string(),
        transports: webAuthnTransportGuard.array().optional(),
      })
    )
    .optional(),
  userVerification: z.enum(['required', 'preferred', 'discouraged']).optional(),
  extensions: z
    .object({
      appid: z.string().optional(),
      credProps: z.boolean().optional(),
      hmacCreateSecret: z.boolean().optional(),
    })
    .optional(),
});

export type WebAuthnAuthenticationOptions = z.infer<typeof webAuthnAuthenticationOptionsGuard>;
