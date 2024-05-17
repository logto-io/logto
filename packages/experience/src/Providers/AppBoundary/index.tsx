import type { ReactElement } from 'react';

import useColorTheme from '@/Providers/AppBoundary/use-color-theme';

import ConfirmModalProvider from '../ConfirmModalProvider';
import IframeModalProvider from '../IframeModalProvider';
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
      <IframeModalProvider>
        <ConfirmModalProvider>
          <ToastProvider>{children}</ToastProvider>
        </ConfirmModalProvider>
      </IframeModalProvider>
    </>
  );
};

export default AppBoundary;
