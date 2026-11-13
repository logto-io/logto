import { z } from 'zod';

const pendingPurchaseGuard = z.object({
  /** The `Idempotency-Key` of every Checkout request of this purchase. */
  key: z.string().min(1),
  /**
   * The billing Customer choice sent with every Checkout request for `key`; `{}` means the default
   * Customer. Saved before the first request, so a retry never asks again or sends another.
   */
  customerChoice: z
    .object({
      customerId: z.string().min(1).optional(),
      newCustomer: z.literal(true).optional(),
    })
    .optional(),
  sessionId: z.string().min(1).optional(),
  licenseId: z.string().min(1).optional(),
});

export type PendingPurchase = z.infer<typeof pendingPurchaseGuard>;

const getPendingPurchaseStorageKey = (userId: string) => `self-hosted-licenses:purchase:${userId}`;

/** Persist before any Checkout request, so a reload resumes with the same `Idempotency-Key`. */
export const savePendingPurchase = (userId: string, purchase: PendingPurchase) => {
  localStorage.setItem(getPendingPurchaseStorageKey(userId), JSON.stringify(purchase));
  return purchase;
};

/** Recover only the same user's purchase; the server resolves Customer and session ownership. */
export const readPendingPurchase = (userId: string): PendingPurchase | undefined => {
  try {
    const stored = localStorage.getItem(getPendingPurchaseStorageKey(userId));
    if (!stored) {
      return;
    }
    const result = pendingPurchaseGuard.safeParse(JSON.parse(stored));
    return result.success ? result.data : undefined;
  } catch {}
};

export const getOrCreatePendingPurchase = (userId: string) =>
  readPendingPurchase(userId) ?? savePendingPurchase(userId, { key: crypto.randomUUID() });

export const clearPendingPurchase = (userId: string) => {
  localStorage.removeItem(getPendingPurchaseStorageKey(userId));
};

/** Clear only the purchase of this Checkout session, never one started again in another tab. */
export const clearPendingPurchaseOfSession = (userId: string, sessionId: string) => {
  if (readPendingPurchase(userId)?.sessionId === sessionId) {
    clearPendingPurchase(userId);
  }
};
