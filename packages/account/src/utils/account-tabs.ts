import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import { buildAccountNavItems } from '@ac/components/account-nav-items';

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
  const hasSessions = hasVisibleSessionsPage(accountCenterSettings);
  const hasProfile = hasVisibleProfilePage(accountCenterSettings, experienceSettings);

  return {
    hasProfile,
    hasSecurity,
    hasSessions,
    navItems: buildAccountNavItems({ hasProfile, hasSecurity, hasSessions }),
  };
};
