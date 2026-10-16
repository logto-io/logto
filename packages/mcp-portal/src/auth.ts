import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

export class AuthError extends Error {}

export type Caller = {
  sub: string;
  scopes: string[];
};

export type Verifier = (token: string) => Promise<Caller>;

const verifyToken = async (
  token: string,
  options: { jwks: ReturnType<typeof createRemoteJWKSet>; issuer: string; audience: string }
): Promise<JWTPayload> => {
  try {
    const { payload } = await jwtVerify(token, options.jwks, {
      issuer: options.issuer,
      audience: options.audience,
    });

    return payload;
  } catch {
    throw new AuthError('Invalid access token');
  }
};

/**
 * Verifies a Logto access token against the issuer's JWKS, the expected audience, and the
 * required scope. Throws `AuthError` for any token the portal should refuse.
 */
export const createVerifier = (options: {
  issuer: string;
  audience: string;
  requiredScope: string;
}): Verifier => {
  const issuer = options.issuer.replace(/\/$/, '');
  const jwks = createRemoteJWKSet(new URL(`${issuer}/jwks`));

  return async (token) => {
    const payload = await verifyToken(token, { jwks, issuer, audience: options.audience });

    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new AuthError('Access token has no subject');
    }

    const scopes = typeof payload.scope === 'string' ? payload.scope.split(' ') : [];

    if (!scopes.includes(options.requiredScope)) {
      throw new AuthError('Access token lacks the required scope');
    }

    return { sub: payload.sub, scopes };
  };
};

export const extractBearerToken = (authorization: string | undefined): string => {
  const match = /^bearer\s+(.+)$/i.exec(authorization ?? '');

  if (!match?.[1]) {
    throw new AuthError('Missing bearer token');
  }

  return match[1];
};
