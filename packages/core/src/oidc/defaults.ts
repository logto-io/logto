import type Provider from 'oidc-provider';
import type { TTLFunction, KoaContextWithOIDC } from 'oidc-provider';

/**
 * Keep the default pre-checks from oidc-provider.
 *
 * @see {@link https://github.com/panva/node-oidc-provider/blob/d6edf2a0b9efc777081e6f9cc358a0677ccd9897/docs/README.md#ttl | ttl's default value}
 */
const refreshTokenTtl = (
  ...[ctx, token, client]: Parameters<TTLFunction<InstanceType<Provider['RefreshToken']>>>
) => {
  if (
    ctx.oidc.entities.RotatedRefreshToken &&
    client.applicationType === 'web' &&
    client.clientAuthMethod === 'none' &&
    !token.isSenderConstrained()
  ) {
    // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
    return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
  }
};

/** @see {@link https://github.com/panva/node-oidc-provider/blob/d6edf2a0b9efc777081e6f9cc358a0677ccd9897/docs/README.md#rotaterefreshtoken | rotateRefreshToken's default value} */
const rotateRefreshToken = (ctx: KoaContextWithOIDC) => {
  const { RefreshToken: refreshToken, Client: client } = ctx.oidc.entities;

  if (!refreshToken || !client) {
    return false;
  }

  // Cap the maximum amount of time a refresh token can be
  // rotated for up to 1 year, afterwards its TTL is final
  if (refreshToken.totalLifetime() >= 365.25 * 24 * 60 * 60) {
    return false;
  }
  // Rotate non sender-constrained public client refresh tokens
  if (client.clientAuthMethod === 'none' && !refreshToken.isSenderConstrained()) {
    return true;
  }
  // Rotate if the token is nearing expiration (it's beyond 70% of its lifetime)
  return refreshToken.ttlPercentagePassed() >= 70;
};

const defaults = { refreshTokenTtl, rotateRefreshToken };

export default defaults;
