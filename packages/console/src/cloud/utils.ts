import type { OnboardingPage } from './types';
import { CloudRoute } from './types';

export const getOnboardPagePathname = (page: OnboardingPage) => `/${CloudRoute.Onboarding}/${page}`;
