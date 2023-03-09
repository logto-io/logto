import { defaultTenantId, ossConsolePath } from '@logto/schemas';

import { OnboardingRoute } from '@/onboarding/types';

import { isCloud } from './cloud';

const isProduction = process.env.NODE_ENV === 'production';

export const adminTenantEndpoint = new URL(
  process.env.ADMIN_ENDPOINT ?? (isProduction ? window.location.origin : 'http://localhost:3002')
);

export const getUserTenantId = () => {
  if (isCloud) {
    const segment = window.location.pathname.split('/')[1];

    // eslint-disable-next-line no-restricted-syntax
    if (Object.values(OnboardingRoute).includes(segment as OnboardingRoute)) {
      return '';
    }

    return segment ?? '';
  }

  return defaultTenantId;
};

export const getBasename = () => (isCloud ? '/' + getUserTenantId() : ossConsolePath);

export const getSignOutRedirectPathname = () => (isCloud ? '/' : ossConsolePath);
