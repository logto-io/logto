/**
 * Temporary in-memory store for encrypted client secrets.
 * In production, this should be replaced with a proper session storage
 * or database table that associates encrypted secrets with access tokens.
 */

type EncryptedSecretEntry = {
  encryptedClientSecret: string;
  createdAt: number;
  userId: string;
};

// In-memory store - in production, use Redis or database
const store = new Map<string, EncryptedSecretEntry>();

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [key, entry] of store.entries()) {
      if (entry.createdAt < oneHourAgo) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export const encryptedSecretStore = {
  /**
   * Store an encrypted client secret for a user
   */
  set(userId: string, encryptedClientSecret: string): void {
    store.set(userId, {
      encryptedClientSecret,
      createdAt: Date.now(),
      userId,
    });
  },

  /**
   * Get the encrypted client secret for a user
   */
  get(userId: string): string | undefined {
    const entry = store.get(userId);
    if (!entry) {
      return undefined;
    }

    return entry.encryptedClientSecret;
  },

  /**
   * Delete the encrypted client secret for a user
   */
  delete(userId: string): void {
    store.delete(userId);
  },
};
