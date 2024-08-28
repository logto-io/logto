import { Theme } from '@logto/schemas';
import { type ReactNode } from 'react';

import UserRoleIconDark from '@/assets/icons/role-feature-dark.svg';
import UserRoleIcon from '@/assets/icons/role-feature.svg';
import useTheme from '@/hooks/use-theme';

const themeToRoleIcon = Object.freeze({
  [Theme.Light]: <UserRoleIcon />,
  [Theme.Dark]: <UserRoleIconDark />,
} satisfies Record<Theme, ReactNode>);

/** Render a role icon according to the current theme. */
const RoleIcon = () => {
  const theme = useTheme();

  return themeToRoleIcon[theme];
};

export default RoleIcon;
