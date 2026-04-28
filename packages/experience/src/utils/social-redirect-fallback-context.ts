import * as s from 'superstruct';

/**
 * Social / SSO Redirect Fallback Context
 *
 * Provides a `localStorage`-based fallback mechanism for preserving redirect context
 * (state, verificationId, session parameters) across in-app browser redirects where
 * `sessionStorage` may be lost due to the browser opening a new WebView/tab.
 *
 * The primary session storage (`sessionStorage`) remains the source of truth. This
 * fallback is only consulted when `sessionStorage` state is missing (not mismatched).
 */

const fallbackKeyPrefix = 'logto:redirect-context:fallback:';

/** Time-to-live for fallback bundles: 10 minutes. */
const ttlMs = 10 * 60 * 1000;

const redirectContextStruct = s.object({
  state: s.string(),
  flow: s.enums(['social', 'sso']),
  connectorId: s.string(),
  verificationId: s.string(),
  createdAt: s.number(),
  expiresAt: s.number(),
  appId: s.optional(s.string()),
  organizationId: s.optional(s.string()),
  uiLocales: s.optional(s.string()),
});

export type RedirectContext = s.Infer<typeof redirectContextStruct>;

const safeParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const parseAndValidate = (raw: string): RedirectContext | undefined => {
  const parsed = safeParse(raw);

  if (!parsed) {
    return undefined;
  }

  const [error, context] = s.validate(parsed, redirectContextStruct);

  if (error) {
    return undefined;
  }

  if (Date.now() > context.expiresAt) {
    return undefined;
  }

  return context;
};

/**
 * Store a redirect context bundle in `localStorage` as a fallback for in-app browsers
 * that may lose `sessionStorage` during external redirects.
 *
 * Timestamps (`createdAt`, `expiresAt`) are set internally.
 * Expired / malformed bundles are swept before writing to prevent orphan accumulation.
 *
 * @param input - The redirect context fields (excluding timestamps).
 */
export const storeRedirectContext = (
  input: Omit<RedirectContext, 'createdAt' | 'expiresAt'>
): void => {
  try {
    const now = Date.now();
    const context: RedirectContext = {
      ...input,
      createdAt: now,
      expiresAt: now + ttlMs,
    };

    s.assert(context, redirectContextStruct);

    // Sweep stale entries before writing — only scans our prefixed keys
    sweepExpiredRedirectContexts();

    localStorage.setItem(`${fallbackKeyPrefix}${input.state}`, JSON.stringify(context));
  } catch {
    // LocalStorage unavailable or quota exceeded
  }
};

/**
 * Retrieve a redirect context bundle by its state parameter.
 *
 * Returns `undefined` if the bundle is not found, malformed, schema-invalid, or expired.
 * Invalid or expired bundles are deleted from `localStorage` as a side effect.
 *
 * @param state - The OAuth state parameter used as the lookup key.
 * @returns The validated redirect context, or `undefined`.
 */
export const getRedirectContextByState = (state: string): RedirectContext | undefined => {
  try {
    const key = `${fallbackKeyPrefix}${state}`;
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return undefined;
    }

    const context = parseAndValidate(raw);

    // Clean up invalid, malformed, or expired entries
    if (!context) {
      localStorage.removeItem(key);
      return undefined;
    }

    return context;
  } catch {
    return undefined;
  }
};

/** Consume (read then delete) a redirect context bundle to prevent replay. */
export const consumeRedirectContext = (state: string): RedirectContext | undefined => {
  const context = getRedirectContextByState(state);

  if (context) {
    removeRedirectContext(state);
  }

  return context;
};

/** Remove a redirect context bundle. Idempotent, never throws. */
export const removeRedirectContext = (state: string): void => {
  try {
    localStorage.removeItem(`${fallbackKeyPrefix}${state}`);
  } catch {
    // LocalStorage unavailable
  }
};

/**
 * Sweep all expired or malformed redirect context bundles from `localStorage`.
 * Only processes keys with the correct prefix to avoid interfering with other data.
 * Reuses {@link parseAndValidate} so validation rules stay in one place.
 *
 * Called by {@link storeRedirectContext} before each write to clean up orphaned entries
 * from abandoned flows (user never returned from IdP). Only scans keys with our prefix.
 */
export const sweepExpiredRedirectContexts = (): void => {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));

    const keysToRemove = keys.filter((key): key is string => {
      if (!key?.startsWith(fallbackKeyPrefix)) {
        return false;
      }

      const raw = localStorage.getItem(key);

      if (raw === null) {
        return false;
      }

      return !parseAndValidate(raw);
    });

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // LocalStorage unavailable
  }
};
