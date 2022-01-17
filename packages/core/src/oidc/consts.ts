import crypto from 'crypto';

import { getEnv } from '@silverhand/essentials';

import { port } from '@/env/consts';

export const privateKey = crypto.createPrivateKey(
  Buffer.from(getEnv('OIDC_PROVIDER_PRIVATE_KEY_BASE64'), 'base64')
);
export const publicKey = crypto.createPublicKey(privateKey);

export const issuer = getEnv('OIDC_ISSUER', `http://localhost:${port}/oidc`);
export const adminResource = getEnv('ADMIN_RESOURCE', 'https://api.logto.io');

export const defaultIdTokenTtl = 60 * 60;
export const defaultRefreshTokenTtl = 14 * 24 * 60 * 60;
