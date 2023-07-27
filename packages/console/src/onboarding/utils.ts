import { joinPath } from '@silverhand/essentials';

import type { OnboardingPage } from './types';
import { OnboardingRoute } from './types';

export const getOnboardingPage = (page: OnboardingPage) =>
  joinPath(OnboardingRoute.Onboarding, page);
