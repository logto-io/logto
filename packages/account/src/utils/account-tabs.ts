import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import { buildAccountNavItems } from '@ac/components/account-nav-items';
import { isDevFeaturesEnabled } from '@ac/constants/env';

import {
  hasVisibleProfilePage,
  hasVisibleSecuritySection,
  hasVisibleSessionsPage,
} from './security-page';

type AccountTabSettings = {
  readonly accountCenterSettings?: PageContextType['accountCenterSettings'];
  readonly experienceSettings?: PageContextType['experienceSettings'];
};

export const getAccountTabSettings = ({
  accountCenterSettings,
  experienceSettings,
}: AccountTabSettings) => {
  const hasSecurity = hasVisibleSecuritySection(accountCenterSettings, experienceSettings);
  // DEV: MFA trusted device management
  const hasSessions = hasVisibleSessionsPage(accountCenterSettings, isDevFeaturesEnabled);
  const hasProfile = hasVisibleProfilePage(accountCenterSettings, experienceSettings);

  return {
    hasProfile,
    hasSecurity,
    hasSessions,
    navItems: buildAccountNavItems({ hasProfile, hasSecurity, hasSessions }),
  };
};
