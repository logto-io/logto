import { SsoProviderName } from '@logto/schemas';
import { z } from 'zod';

const operationGuard = z.object({
  key: z.string().min(1),
  providerName: z.nativeEnum(SsoProviderName),
});
const storageKey = (userId: string) => `console-sso:create:${userId}`;

/** Recover only the same user's operation; the server resolves customer ownership. */
export const readCreation = (userId: string) => {
  try {
    const stored = localStorage.getItem(storageKey(userId));
    if (!stored) {
      return;
    }
    const result = operationGuard.safeParse(JSON.parse(stored));
    return result.success ? result.data : undefined;
  } catch {}
};

/** Persist before sending a request so a lost response or reload cannot create a duplicate. */
export const startCreation = (userId: string, providerName: SsoProviderName) => {
  const existing = readCreation(userId);
  if (existing) {
    return existing;
  }
  const operation = { key: crypto.randomUUID(), providerName };
  localStorage.setItem(storageKey(userId), JSON.stringify(operation));
  return operation;
};

export const finishCreation = (userId: string) => {
  localStorage.removeItem(storageKey(userId));
};
