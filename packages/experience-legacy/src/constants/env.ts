import { yes } from '@silverhand/essentials';

const normalizeEnv = (value: unknown) =>
  value === null || value === undefined ? undefined : String(value);

const isProduction = import.meta.env.PROD;

export const isDevFeaturesEnabled =
  !isProduction || yes(normalizeEnv(import.meta.env.DEV_FEATURES_ENABLED));
