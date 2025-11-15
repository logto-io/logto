import useColorTheme from '@/Providers/AppBoundary/use-color-theme';
import type { ReactElement } from 'react';

import AppMeta from './AppMeta';

type Props = {
  readonly children: ReactElement;
};

const AppBoundary = ({ children }: Props) => {
  useColorTheme();

  return (
    <>
      <AppMeta />
      {children}
    </>
  );
};

export default AppBoundary;
