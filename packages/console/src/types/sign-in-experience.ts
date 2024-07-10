// This is required to ensure the URLs will be reset when removing an image. RHF will ignore the

import { type SignInExperience } from '@logto/schemas';

// `undefined` value, so we need to provide an empty string to trigger the reset.
export const emptyBranding: Required<SignInExperience['branding']> = Object.freeze({
  logoUrl: '',
  darkLogoUrl: '',
  favicon: '',
  darkFavicon: '',
});
