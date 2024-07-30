import { Theme } from '@logto/schemas';
import { type ReactNode } from 'react';

import FileIconDark from '@/assets/icons/file-icon-dark.svg?react';
import FileIconLight from '@/assets/icons/file-icon.svg?react';
import useTheme from '@/hooks/use-theme';

const themeToRoleIcon = Object.freeze({
  [Theme.Light]: <FileIconLight />,
  [Theme.Dark]: <FileIconDark />,
} satisfies Record<Theme, ReactNode>);

/** Render a role icon according to the current theme. */
const FileIcon = () => {
  const theme = useTheme();

  return themeToRoleIcon[theme];
};

export default FileIcon;
