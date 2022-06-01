import { AppearanceMode } from '@logto/schemas';
import React, { ReactNode, useEffect } from 'react';

import { themeStorageKey } from '@/consts';
import useAdminConsoleConfigs from '@/hooks/use-configs';
import initI18n from '@/i18n/init';

import * as styles from './index.module.scss';

type Props = {
  children?: ReactNode;
};

const AppBoundary = ({ children }: Props) => {
  const defaultTheme = localStorage.getItem(themeStorageKey) ?? AppearanceMode.SyncWithSystem;
  const { configs } = useAdminConsoleConfigs();
  const theme = configs?.appearanceMode ?? defaultTheme;

  useEffect(() => {
    const isFollowSystem = theme === AppearanceMode.SyncWithSystem;
    const className = styles[theme] ?? '';

    if (!isFollowSystem) {
      document.body.classList.add(className);
    }

    return () => {
      if (!isFollowSystem) {
        document.body.classList.remove(className);
      }
    };
  }, [theme]);

  useEffect(() => {
    (async () => {
      void initI18n(configs?.language);
    })();
  }, [configs?.language]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default AppBoundary;
