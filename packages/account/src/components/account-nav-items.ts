import ProfileIcon from '@ac/assets/icons/profile.svg?react';
import ShieldIcon from '@ac/assets/icons/shield.svg?react';
import { profileRoute, securityRoute } from '@ac/constants/routes';

export type AccountNavItem = {
  readonly to: string;
  readonly labelKey:
    | 'account_center.page.sidebar_personal_info'
    | 'account_center.page.sidebar_security';
  readonly Icon: SvgComponent;
};

type BuildAccountNavItemsOptions = {
  readonly hasProfile: boolean;
  readonly hasSecurity: boolean;
};

export const buildAccountNavItems = ({
  hasProfile,
  hasSecurity,
}: BuildAccountNavItemsOptions): AccountNavItem[] => [
  ...(hasProfile
    ? [
        {
          to: profileRoute,
          labelKey: 'account_center.page.sidebar_personal_info' as const,
          Icon: ProfileIcon,
        },
      ]
    : []),
  ...(hasSecurity
    ? [
        {
          to: securityRoute,
          labelKey: 'account_center.page.sidebar_security' as const,
          Icon: ShieldIcon,
        },
      ]
    : []),
];
