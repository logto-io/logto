import { yes } from '@silverhand/essentials';

export const isDevelopmentFeaturesEnabled =
  yes(process.env.DEV_FEATURES_ENABLED) || yes(process.env.INTEGRATION_TEST);
