import type { OnboardPage } from './types';
import { CloudRoute } from './types';

export const getOnboardPagePathname = (page: OnboardPage) => `/${CloudRoute.Onboard}/${page}`;
