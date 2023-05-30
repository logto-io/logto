import { joinPath } from '@silverhand/essentials';

import type { OnboardingPage } from './types';
import { OnboardingRoute } from './types';

export const getOnboardingPage = (page: OnboardingPage) =>
  joinPath(OnboardingRoute.Onboarding, page);

/** This function is updated from the Google Tag official code snippet. */
export function gtag(..._: unknown[]) {
  if (!window.dataLayer) {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.dataLayer = [];
  }

  // We cannot use rest params here since gtag has some internal logic about `arguments` for data transpiling
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods, prefer-rest-params
  window.dataLayer.push(arguments);
}
