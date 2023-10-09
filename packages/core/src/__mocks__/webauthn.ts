import { type WebAuthnRegistrationOptions } from '@logto/schemas';

export const mockWebAuthnCreationOptions: WebAuthnRegistrationOptions = {
  rp: {
    name: 'Logto',
    id: 'logto.io',
  },
  user: {
    id: 'id',
    name: 'test-user',
    displayName: 'Test User',
  },
  challenge: 'challenge',
  pubKeyCredParams: [
    {
      type: 'public-key',
      alg: -7,
    },
  ],
};
