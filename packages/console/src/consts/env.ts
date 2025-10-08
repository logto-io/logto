import { yes } from '@silverhand/essentials';

import { storageKeys } from './storage';

const normalizeEnv = (value: unknown) =>
  value === null || value === undefined ? undefined : String(value);

const isProduction = import.meta.env.PROD;
export const isCloud = yes(normalizeEnv(import.meta.env.IS_CLOUD));
export const adminEndpoint = normalizeEnv(import.meta.env.ADMIN_ENDPOINT);

export const isDevFeaturesEnabled =
  !isProduction ||
  yes(normalizeEnv(import.meta.env.DEV_FEATURES_ENABLED)) ||
  yes(localStorage.getItem(storageKeys.isDevFeaturesEnabled));

export const consoleEmbeddedPricingUrl =
  normalizeEnv(import.meta.env.CONSOLE_EMBEDDED_PRICING_URL) ??
  'https://logto.io/console-embedded-pricing';

export const inkeepApiKey = normalizeEnv(import.meta.env.INKEEP_API_KEY);
export const postHogKey = normalizeEnv(import.meta.env.POSTHOG_PUBLIC_KEY);
/**
 * The PostHog API host URL. When using a self-hosted PostHog instance or a custom domain,
 * {@link postHogUiHost} should also be set accordingly.
 *
 * @see https://posthog.com/docs/libraries/js/config for more details.
 */
export const postHogHost = normalizeEnv(import.meta.env.POSTHOG_PUBLIC_HOST);
/**
 * The PostHog UI host URL. If {@link postHogHost} is set to a custom host, this should also be set accordingly.
 *
 * @see https://posthog.com/docs/libraries/js/config for more details.
 */
export const postHogUiHost = normalizeEnv(import.meta.env.POSTHOG_PUBLIC_UI_HOST);
