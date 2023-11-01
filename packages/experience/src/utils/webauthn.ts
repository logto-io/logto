import {
  webAuthnRegistrationOptionsGuard,
  webAuthnAuthenticationOptionsGuard,
} from '@logto/schemas';

import { type WebAuthnOptions } from '@/types';

export const isWebAuthnOptions = (options: Record<string, unknown>): options is WebAuthnOptions =>
  webAuthnRegistrationOptionsGuard.safeParse(options).success ||
  webAuthnAuthenticationOptionsGuard.safeParse(options).success;
