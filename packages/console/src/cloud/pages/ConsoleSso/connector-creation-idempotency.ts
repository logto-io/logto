import { SsoProviderName } from '@logto/schemas';
import { z } from 'zod';

const pendingConnectorCreationGuard = z.object({
  key: z.string().min(1),
  providerName: z.nativeEnum(SsoProviderName),
  funding: z.enum(['included', 'personal']).optional(),
  subscriptionId: z.string().optional(),
  checkoutKey: z.string().optional(),
  sessionId: z.string().optional(),
});
export type PendingConnectorCreation = z.infer<typeof pendingConnectorCreationGuard>;

/** Persist recovery before any billing or connector write. */
export const savePendingConnectorCreation = (
  userId: string,
  operation: PendingConnectorCreation
) => {
  localStorage.setItem(getPendingConnectorCreationStorageKey(userId), JSON.stringify(operation));
  return operation;
};

const getPendingConnectorCreationStorageKey = (userId: string) => `console-sso:create:${userId}`;

/** Recover only the same user's operation; the server resolves customer ownership. */
export const readPendingConnectorCreation = (userId: string) => {
  try {
    const stored = localStorage.getItem(getPendingConnectorCreationStorageKey(userId));
    if (!stored) {
      return;
    }
    const result = pendingConnectorCreationGuard.safeParse(JSON.parse(stored));
    return result.success ? result.data : undefined;
  } catch {}
};

/** Persist before sending a request so a lost response or reload cannot create a duplicate. */
export const getOrCreatePendingConnectorCreation = (
  userId: string,
  providerName: SsoProviderName
) => {
  const existing = readPendingConnectorCreation(userId);
  if (existing) {
    return existing;
  }
  const operation = { key: crypto.randomUUID(), providerName };
  return savePendingConnectorCreation(userId, operation);
};

export const clearPendingConnectorCreation = (userId: string) => {
  localStorage.removeItem(getPendingConnectorCreationStorageKey(userId));
};
