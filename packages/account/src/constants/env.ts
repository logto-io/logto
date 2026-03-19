import { getIsDevFeaturesEnabled } from '@ac/utils/dev-features';

export const isDevFeaturesEnabled = getIsDevFeaturesEnabled(
  __ACCOUNT_IS_PRODUCTION__,
  __ACCOUNT_DEV_FEATURES_ENABLED__
);
