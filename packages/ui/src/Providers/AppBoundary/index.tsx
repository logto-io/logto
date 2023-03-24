import { conditionalString } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useContext, useEffect } from 'react';

import useColorTheme from '@/hooks/use-color-theme';
import { PageContext } from '@/hooks/use-page-context';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';
import ConfirmModalProvider from '../ConfirmModalProvider';
import IframeModalProvider from '../IframeModalProvider';
import ToastProvider from '../ToastProvider';

type Props = {
  children: ReactNode;
};

const AppBoundary = ({ children }: Props) => {
  // Set Primary Color
  useColorTheme();
  const theme = useTheme();

  const { platform } = useContext(PageContext);

  // Set Theme Mode
  useEffect(() => {
    document.body.classList.remove(conditionalString(styles.light), conditionalString(styles.dark));
    document.body.classList.add(conditionalString(styles[theme]));
  }, [theme]);

  // Apply Platform Style
  useEffect(() => {
    document.body.classList.remove('desktop', 'mobile');
    document.body.classList.add(platform === 'mobile' ? 'mobile' : 'desktop');
  }, [platform]);

  return (
    <IframeModalProvider>
      <ConfirmModalProvider>
        <ToastProvider>{children}</ToastProvider>
      </ConfirmModalProvider>
    </IframeModalProvider>
  );
};

export default AppBoundary;
