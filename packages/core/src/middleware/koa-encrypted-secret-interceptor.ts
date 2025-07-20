import type { MiddlewareType, ParameterizedContext } from 'koa';
import type { Provider } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';
import { encryptedSecretStore } from '#src/utils/encrypted-secret-store.js';

const getUserIdFromToken = (idToken: unknown): string | undefined => {
  if (typeof idToken !== 'string') {
    return undefined;
  }

  try {
    const [, payload] = idToken.split('.');
    if (!payload) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return decodedPayload.sub;
  } catch {
    return undefined;
  }
};

const shouldProcessResponse = (ctx: ParameterizedContext): boolean => {
  // Only process token endpoint responses
  if (!ctx.path.endsWith('/token') || ctx.method !== 'POST') {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const grantType = ctx.request.body?.grant_type || ctx.oidc?.params?.grant_type;
  if (grantType !== 'authorization_code') {
    return false;
  }

  return ctx.status === 200 && Boolean(ctx.body) && typeof ctx.body === 'object';
};

/**
 * Middleware for intercepting token responses and adding encrypted client secrets.
 * Currently unused but preserved for future zero-knowledge authentication features.
 */
function koaEncryptedSecretInterceptor(
  provider: Provider,
  queries: Queries,
  tenantId: string
): MiddlewareType {
  return async (ctx, next) => {
    await next();

    if (!shouldProcessResponse(ctx)) {
      return;
    }

    if (typeof ctx.body !== 'object' || !ctx.body) {
      return;
    }

    const { body } = ctx;

    if (!('id_token' in body)) {
      return;
    }

    const userId = getUserIdFromToken(body.id_token);

    if (!userId) {
      return;
    }

    try {
      // Retrieve the encrypted client secret from the in-memory store
      const encryptedClientSecret = encryptedSecretStore.get(userId);

      if (!encryptedClientSecret) {
        return;
      }

      // Add the encrypted client secret to the response body
      ctx.body = {
        ...ctx.body,
        encrypted_client_secret: encryptedClientSecret,
      };

      encryptedSecretStore.delete(userId);
    } catch {
      // Ignore errors when retrieving encrypted secret
    }
  };
}

// Export commented out to avoid unused export lint error
// export default koaEncryptedSecretInterceptor;
