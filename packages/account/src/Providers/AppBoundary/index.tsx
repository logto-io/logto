import useColorTheme from '@/Providers/AppBoundary/use-color-theme';
import type { ReactElement } from 'react';

import ReauthPromptProvider from '../ReauthPromptProvider';
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
      <ToastProvider>
        <ReauthPromptProvider>{children}</ReauthPromptProvider>
      </ToastProvider>
    </>
  );
};

export default AppBoundary;
