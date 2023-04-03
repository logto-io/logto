import type { ReactElement } from 'react';

import useColorTheme from '@/Providers/AppBoundary/hooks/use-color-theme';

import ConfirmModalProvider from '../ConfirmModalProvider';
import IframeModalProvider from '../IframeModalProvider';
import ToastProvider from '../ToastProvider';

import useCustomStyle from './hooks/use-custom-style';
import useMetaData from './hooks/use-meta-data';
import useTheme from './hooks/use-theme';

type Props = {
  children: ReactElement;
};

const AppBoundary = ({ children }: Props) => {
  useColorTheme();
  useCustomStyle();
  useTheme();

  useMetaData();

  return (
    <IframeModalProvider>
      <ConfirmModalProvider>
        <ToastProvider>{children}</ToastProvider>
      </ConfirmModalProvider>
    </IframeModalProvider>
  );
};

export default AppBoundary;
