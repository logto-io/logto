import useColorTheme from '@/Providers/AppBoundary/use-color-theme';
import type { ReactElement } from 'react';

import ToastProvider from '../ToastProvider';

import AppMeta from './AppMeta';

type Props = {
  readonly children: ReactElement;
};

const AppBoundary = ({ children }: Props) => {
  useColorTheme();

  return (
    <>
      <AppMeta />
      <ToastProvider>{children}</ToastProvider>
    </>
  );
};

export default AppBoundary;
