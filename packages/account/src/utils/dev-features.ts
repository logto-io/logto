import { yes } from '@silverhand/essentials';

export const getIsDevFeaturesEnabled = (
  isProductionBuild: boolean,
  devFeaturesEnabled?: string
): boolean => !isProductionBuild || yes(devFeaturesEnabled);
