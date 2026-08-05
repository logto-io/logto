import assert from 'node:assert';
import { generateKeyPairSync } from 'node:crypto';

import {
  LogtoOidcConfigKey,
  OidcSigningKeyStatus,
  defaultCimdConfig,
  type LogtoOidcConfigType,
} from '@logto/schemas';
import { SignJWT, importJWK, jwtVerify } from 'jose';

import loadOidcValues from './oidc.js';

const issuer = 'https://logto.test/oidc';

const generateEcPrivateKeyPem = (namedCurve: string) =>
  generateKeyPairSync('ec', { namedCurve })
    .privateKey.export({ type: 'pkcs8', format: 'pem' })
    .toString();

const generateRsaPrivateKeyPem = () =>
  generateKeyPairSync('rsa', { modulusLength: 2048 })
    .privateKey.export({ type: 'pkcs8', format: 'pem' })
    .toString();

const buildConfigs = (privateKeyPems: string[]): LogtoOidcConfigType => ({
  [LogtoOidcConfigKey.PrivateKeys]: privateKeyPems.map((value, index) => ({
    id: `private-key-${index}`,
    value,
    createdAt: index,
    status: index === 0 ? OidcSigningKeyStatus.Current : OidcSigningKeyStatus.Previous,
  })),
  [LogtoOidcConfigKey.CookieKeys]: [{ id: 'cookie-key', value: 'cookie-key-value', createdAt: 0 }],
  [LogtoOidcConfigKey.Session]: {},
});

describe('loadOidcValues', () => {
  it.each([
    ['prime256v1', 'ES256'],
    ['secp384r1', 'ES384'],
    ['secp521r1', 'ES512'],
  ])('derives the signing algorithm from the %s current key', async (namedCurve, expected) => {
    const { jwkSigningAlg, privateJwks, localJWKSet } = await loadOidcValues(
      issuer,
      buildConfigs([generateEcPrivateKeyPem(namedCurve)]),
      defaultCimdConfig
    );

    expect(jwkSigningAlg).toBe(expected);

    /**
     * The declared algorithm must be one the current key can actually sign with — with a
     * mismatched declaration (e.g. `ES384` hardcoded for a P-256 key), `importJWK` rejects the
     * curve and this round trip fails.
     */
    const [currentPrivateJwk] = privateJwks;
    assert(currentPrivateJwk && jwkSigningAlg);
    const signingKey = await importJWK(currentPrivateJwk, jwkSigningAlg);
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: jwkSigningAlg, kid: currentPrivateJwk.kid })
      .sign(signingKey);
    const { protectedHeader } = await jwtVerify(jwt, localJWKSet);

    expect(protectedHeader.alg).toBe(expected);
  });

  it('keeps the signing algorithm undefined for an RSA current key', async () => {
    const { jwkSigningAlg } = await loadOidcValues(
      issuer,
      buildConfigs([generateRsaPrivateKeyPem()]),
      defaultCimdConfig
    );

    expect(jwkSigningAlg).toBeUndefined();
  });

  it('follows the current key when a previous key of another type remains in rotation grace', async () => {
    const { jwkSigningAlg, privateJwks, publicJwks } = await loadOidcValues(
      issuer,
      buildConfigs([generateEcPrivateKeyPem('prime256v1'), generateRsaPrivateKeyPem()]),
      defaultCimdConfig
    );

    expect(jwkSigningAlg).toBe('ES256');
    expect(privateJwks).toHaveLength(2);
    expect(publicJwks).toHaveLength(2);
  });
});
