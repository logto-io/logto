import { AppearanceMode } from '@logto/schemas';
import React, { ReactNode, useEffect } from 'react';

import useUserPreferences from '@/hooks/use-user-preferences';
import initI18n from '@/i18n/init';

import * as styles from './index.module.scss';

type Props = {
  children?: ReactNode;
};

const AppBoundary = ({ children }: Props) => {
  const {
    data: { appearanceMode, language },
  } = useUserPreferences();

  useEffect(() => {
    const isFollowSystem = appearanceMode === AppearanceMode.SyncWithSystem;
    const className = styles[appearanceMode] ?? '';

    if (!isFollowSystem) {
      document.body.classList.add(className);
    }

    return () => {
      if (!isFollowSystem) {
        document.body.classList.remove(className);
      }
    };
  }, [appearanceMode]);

  useEffect(() => {
    (async () => {
      void initI18n(language);
    })();
  }, [language]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default AppBoundary;
