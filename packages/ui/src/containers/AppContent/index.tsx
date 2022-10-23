import { conditionalString } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useEffect, useCallback, useContext } from 'react';

import Toast from '@/components/Toast';
import ConfirmModalProvider from '@/containers/ConfirmModalProvider';
import useColorTheme from '@/hooks/use-color-theme';
import { PageContext } from '@/hooks/use-page-context';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

export type Props = {
  children: ReactNode;
};

const AppContent = ({ children }: Props) => {
  const theme = useTheme();
  const { toast, platform, setToast, experienceSettings } = useContext(PageContext);

  // Prevent internal eventListener rebind
  const hideToast = useCallback(() => {
    setToast('');
  }, [setToast]);

  // Set Primary Color
  useColorTheme();

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
    <ConfirmModalProvider>
      <div className={styles.container}>
        {platform === 'web' && <div className={styles.placeHolder} />}
        <main className={styles.main}>{children}</main>
        {platform === 'web' && <div className={styles.placeHolder} />}
        <Toast message={toast} callback={hideToast} />
      </div>
    </ConfirmModalProvider>
  );
};

export default AppContent;
