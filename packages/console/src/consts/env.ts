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

export const isMultipleCustomDomainsEnabled = yes(
  normalizeEnv(import.meta.env.MULTIPLE_CUSTOM_DOMAINS_ENABLED)
);

export const inkeepApiKey = normalizeEnv(import.meta.env.INKEEP_API_KEY);
export const postHogKey = normalizeEnv(import.meta.env.POSTHOG_PUBLIC_KEY);
export const postHogHost = normalizeEnv(import.meta.env.POSTHOG_PUBLIC_HOST);
