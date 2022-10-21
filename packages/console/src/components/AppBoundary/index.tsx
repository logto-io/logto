import { AppearanceMode } from '@logto/schemas';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import useUserPreferences from '@/hooks/use-user-preferences';
import initI18n from '@/i18n/init';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

const AppBoundary = ({ children }: Props) => {
  const {
    data: { appearanceMode, language },
  } = useUserPreferences();

  useEffect(() => {
    const isSyncWithSystem = appearanceMode === AppearanceMode.SyncWithSystem;
    const className = styles[appearanceMode] ?? '';

    if (!isSyncWithSystem) {
      document.body.classList.add(className);
    }

    return () => {
      if (!isSyncWithSystem) {
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
