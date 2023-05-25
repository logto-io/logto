import { joinPath } from '@silverhand/essentials';

import type { OnboardingPage } from './types';
import { OnboardingRoute } from './types';

export const getOnboardingPage = (page: OnboardingPage) =>
  joinPath(OnboardingRoute.Onboarding, page);

export const gtag = (...args: unknown[]) => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  window.dataLayer?.push(args);
};
