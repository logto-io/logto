import { yes } from '@silverhand/essentials';

// eslint-disable-next-line unicorn/prevent-abbreviations -- keep the same as in other packages
export const isDevFeaturesEnabled =
  process.env.NODE_ENV !== 'production' ||
  yes(process.env.DEV_FEATURES_ENABLED) ||
  yes(process.env.INTEGRATION_TEST);

export const singleSignOnPath = 'single-sign-on';
