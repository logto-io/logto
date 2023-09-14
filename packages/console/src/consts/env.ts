import { yes } from '@silverhand/essentials';

export const isProduction = process.env.NODE_ENV === 'production';
export const isCloud = yes(process.env.IS_CLOUD);
export const adminEndpoint = process.env.ADMIN_ENDPOINT;
// eslint-disable-next-line unicorn/prevent-abbreviations -- we love dev
export const isDevFeaturesEnabled =
  yes(process.env.DEV_FEATURES_ENABLED) || yes(process.env.INTEGRATION_TEST);
