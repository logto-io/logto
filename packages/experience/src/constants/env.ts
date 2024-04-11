import { yes } from '@silverhand/essentials';

export const isDevFeaturesEnabled =
  process.env.NODE_ENV !== 'production' ||
  yes(process.env.DEV_FEATURES_ENABLED) ||
  yes(process.env.INTEGRATION_TEST);
