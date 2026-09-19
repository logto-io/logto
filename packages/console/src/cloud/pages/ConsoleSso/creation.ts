import { SsoProviderName } from '@logto/schemas';
import { z } from 'zod';

const operationGuard = z.object({
  key: z.string().min(1),
  providerName: z.nativeEnum(SsoProviderName),
});
const storageKey = (userId: string, customerId: string) =>
  `console-sso:create:${userId}:${customerId}`;

/** Recover only the same user's operation against the same server-resolved customer. */
export const readCreation = (userId: string, customerId: string) => {
  try {
    const stored = localStorage.getItem(storageKey(userId, customerId));
    if (!stored) {
      return;
    }
    const result = operationGuard.safeParse(JSON.parse(stored));
    return result.success ? result.data : undefined;
  } catch {}
};

/** Persist before sending a request so a lost response or reload cannot create a duplicate. */
export const startCreation = (
  userId: string,
  customerId: string,
  providerName: SsoProviderName
) => {
  const existing = readCreation(userId, customerId);
  if (existing) {
    return existing;
  }
  const operation = { key: crypto.randomUUID(), providerName };
  localStorage.setItem(storageKey(userId, customerId), JSON.stringify(operation));
  return operation;
};

export const finishCreation = (userId: string, customerId: string) => {
  localStorage.removeItem(storageKey(userId, customerId));
};
