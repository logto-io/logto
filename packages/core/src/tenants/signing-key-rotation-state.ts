import type { SigningKeyRotationState } from '@logto/schemas';

import { WellKnownCache } from '#src/caches/well-known.js';

type SigningKeyRotationStateQueries = {
  getSigningKeyRotationState: () => Promise<SigningKeyRotationState | undefined>;
};

export const syncSigningKeyRotationStateCache = async (
  wellKnownCache: WellKnownCache,
  signingKeyRotationState?: SigningKeyRotationState
) =>
  Promise.all([
    wellKnownCache.set(
      'signing-key-rotation-state',
      WellKnownCache.defaultKey,
      signingKeyRotationState ?? null
    ),
    signingKeyRotationState?.tenantCacheExpiresAt === undefined
      ? Promise.resolve()
      : wellKnownCache.set(
          'tenant-cache-expires-at',
          WellKnownCache.defaultKey,
          signingKeyRotationState.tenantCacheExpiresAt
        ),
  ]);

export const getSigningKeyRotationState = async ({
  wellKnownCache,
  queries,
}: {
  wellKnownCache: WellKnownCache;
  queries: SigningKeyRotationStateQueries;
}): Promise<SigningKeyRotationState | undefined> => {
  const cachedSigningKeyRotationState = await wellKnownCache.get(
    'signing-key-rotation-state',
    WellKnownCache.defaultKey
  );

  if (cachedSigningKeyRotationState !== undefined) {
    return cachedSigningKeyRotationState ?? undefined;
  }

  const signingKeyRotationState = await queries.getSigningKeyRotationState();

  await syncSigningKeyRotationStateCache(wellKnownCache, signingKeyRotationState);

  return signingKeyRotationState;
};

export const isTenantHealthy = (
  createdAt: number,
  signingKeyRotationState?: SigningKeyRotationState
) => {
  const { tenantCacheExpiresAt, signingKeyRotationAt } = signingKeyRotationState ?? {};
  const cacheInvalidated = tenantCacheExpiresAt !== undefined && createdAt <= tenantCacheExpiresAt;
  const stagedActivationDue =
    signingKeyRotationAt !== undefined &&
    signingKeyRotationAt <= Date.now() &&
    createdAt < signingKeyRotationAt;

  return !cacheInvalidated && !stagedActivationDue;
};
