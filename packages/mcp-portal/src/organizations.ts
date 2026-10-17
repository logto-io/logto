import { createHash } from 'node:crypto';

import { z } from 'zod';

/** Returns the IDs of the organizations the token's user belongs to. Throws when Logto cannot say. */
export type OrganizationLookup = (accessToken: string) => Promise<string[]>;

export type OrganizationLookupOptions = {
  issuer: string;
  /** How long one answer is reused. A user removed from an organization keeps access until then. */
  ttlMs?: number;
  maxEntries?: number;
  fetch?: typeof fetch;
  now?: () => number;
};

const requestTimeoutMs = 5000;

const discoverySchema = z.object({ userinfo_endpoint: z.string().url() });
const userinfoSchema = z.object({ organizations: z.array(z.unknown()).optional() });

/**
 * Reads the `organizations` claim from Logto's userinfo endpoint, with the caller's own token. Logto
 * puts that claim in userinfo rather than in access tokens, and only when the token carries the
 * `urn:logto:scope:organizations` scope. A token without the scope gets an empty list, so it is denied.
 */
export const createOrganizationLookup = (
  options: OrganizationLookupOptions
): OrganizationLookup => {
  const issuer = options.issuer.replace(/\/$/, '');
  const ttlMs = options.ttlMs ?? 60_000;
  const maxEntries = options.maxEntries ?? 1000;
  const fetchImpl = options.fetch ?? fetch;
  const now = options.now ?? Date.now;
  const cache = new Map<string, { ids: string[]; expiresAt: number }>();
  // Holds the discovered userinfo endpoint. Cleared on failure, so the next request retries.
  const endpointMemo = new Map<'userinfo', Promise<string>>();

  const discover = async (): Promise<string> => {
    const memoized = endpointMemo.get('userinfo');

    if (memoized) {
      return memoized;
    }

    const found = (async () => {
      const response = await fetchImpl(`${issuer}/.well-known/openid-configuration`, {
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      const parsed = discoverySchema.safeParse(await response.json());

      if (!response.ok || !parsed.success) {
        throw new Error('Userinfo endpoint is not available');
      }

      return parsed.data.userinfo_endpoint;
    })();

    endpointMemo.set('userinfo', found);

    try {
      return await found;
    } catch (error: unknown) {
      endpointMemo.delete('userinfo');
      throw error;
    }
  };

  return async (accessToken) => {
    const key = createHash('sha256').update(accessToken).digest('hex');
    const cached = cache.get(key);

    if (cached && cached.expiresAt > now()) {
      return cached.ids;
    }

    const response = await fetchImpl(await discover(), {
      headers: { accept: 'application/json', authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Userinfo returned ${response.status}`);
    }

    const parsed = userinfoSchema.safeParse(await response.json());
    const ids = (parsed.success ? (parsed.data.organizations ?? []) : []).filter(
      (id): id is string => typeof id === 'string'
    );

    if (cache.size >= maxEntries) {
      // Maps keep insertion order, so the first key is the oldest answer.
      const oldest = cache.keys().next();

      if (!oldest.done) {
        cache.delete(oldest.value);
      }
    }

    cache.set(key, { ids, expiresAt: now() + ttlMs });

    return ids;
  };
};
