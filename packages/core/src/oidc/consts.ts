import crypto from 'crypto';

import { port } from '@/env/consts';
import { getEnv } from '@/utils/env';

export const privateKey = crypto.createPrivateKey(
  Buffer.from(getEnv('OIDC_PROVIDER_PRIVATE_KEY_BASE64'), 'base64')
);
export const publicKey = crypto.createPublicKey(privateKey);

export const issuer = getEnv('OIDC_ISSUER', `http://localhost:${port}/oidc`);
export const adminResource = getEnv('ADMIN_RESOURCE', 'https://api.logto.io');
