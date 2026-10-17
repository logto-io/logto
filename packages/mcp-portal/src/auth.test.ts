import { createServer, type Server } from 'node:http';

import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { afterAll, describe, expect, it } from 'vitest';

import { AuthError, createVerifier, extractBearerToken } from './auth.js';

/**
 * Covers `createVerifier` in src/auth.ts with real RS256 tokens. A local HTTP server serves the
 * JWKS, so jose checks the signature, issuer, audience and expiry exactly as in production. Only
 * the issuer URL differs from Logto's.
 */
const audience = 'https://portal.example.com';
const requiredScope = 'mcp:use';

type TokenClaims = {
  sub?: string;
  scope?: string;
  audience?: string;
  issuer?: string;
  exp?: string;
};

const startFixture = async () => {
  const trusted = await generateKeyPair('RS256');
  const untrusted = await generateKeyPair('RS256');
  const jwk = {
    ...(await exportJWK(trusted.publicKey)),
    kid: 'test-key',
    alg: 'RS256',
    use: 'sig',
  };

  const server: Server = createServer((request, response) => {
    if (request.url === '/oidc/jwks') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ keys: [jwk] }));
      return;
    }

    response.writeHead(404).end();
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve();
    });
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  return {
    server,
    issuer: `http://127.0.0.1:${port}/oidc`,
    trustedKey: trusted.privateKey,
    untrustedKey: untrusted.privateKey,
  };
};

describe('createVerifier', () => {
  const fixturePromise = startFixture();

  afterAll(async () => {
    const { server } = await fixturePromise;
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  const sign = async (claims: TokenClaims, useUntrustedKey = false) => {
    const { issuer, trustedKey, untrustedKey } = await fixturePromise;
    const builder = new SignJWT({ scope: claims.scope ?? requiredScope })
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuer(claims.issuer ?? issuer)
      .setAudience(claims.audience ?? audience)
      .setIssuedAt()
      .setExpirationTime(claims.exp ?? '5m');
    const withSubject = claims.sub === undefined ? builder : builder.setSubject(claims.sub);

    return withSubject.sign(useUntrustedKey ? untrustedKey : trustedKey);
  };

  const verifier = async () => {
    const { issuer } = await fixturePromise;

    return createVerifier({ issuer, audience: [audience], requiredScope });
  };

  it('accepts a valid token and returns the subject and scopes', async () => {
    const token = await sign({ sub: 'alice', scope: `openid ${requiredScope}` });

    await expect((await verifier())(token)).resolves.toEqual({
      sub: 'alice',
      scopes: ['openid', requiredScope],
    });
  });

  it('rejects a token signed by a different key', async () => {
    const token = await sign({ sub: 'alice' }, true);

    await expect((await verifier())(token)).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects a token issued for another audience', async () => {
    const token = await sign({ sub: 'alice', audience: 'https://other.example.com' });

    await expect((await verifier())(token)).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects a token from another issuer', async () => {
    const token = await sign({ sub: 'alice', issuer: 'https://evil.example.com/oidc' });

    await expect((await verifier())(token)).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects an expired token', async () => {
    const token = await sign({ sub: 'alice', exp: '-1m' });

    await expect((await verifier())(token)).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects a token without the required scope', async () => {
    const token = await sign({ sub: 'alice', scope: 'openid profile' });

    await expect((await verifier())(token)).rejects.toThrow('lacks the required scope');
  });

  it('rejects a token with no subject', async () => {
    const token = await sign({});

    await expect((await verifier())(token)).rejects.toThrow('no subject');
  });
});

describe('extractBearerToken', () => {
  it('returns the token from a Bearer header, case-insensitively', () => {
    expect(extractBearerToken('bearer abc.def')).toBe('abc.def');
  });

  it.each([undefined, '', 'Basic abc', 'Bearer '])('rejects %j', (header) => {
    expect(() => extractBearerToken(header)).toThrow(AuthError);
  });
});
