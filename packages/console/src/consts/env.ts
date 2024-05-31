import { yes } from '@silverhand/essentials';

import { storageKeys } from './storage';

const isProduction = process.env.NODE_ENV === 'production';
export const isCloud = yes(process.env.IS_CLOUD);
export const adminEndpoint = process.env.ADMIN_ENDPOINT;

export const isDevFeaturesEnabled =
  !isProduction ||
  yes(process.env.DEV_FEATURES_ENABLED) ||
  yes(process.env.INTEGRATION_TEST) ||
  yes(localStorage.getItem(storageKeys.isDevFeaturesEnabled));
