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
