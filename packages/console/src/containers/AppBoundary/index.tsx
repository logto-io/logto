import type { ReactNode } from 'react';
import { useEffect } from 'react';

import useUserPreferences from '@/hooks/use-user-preferences';
import initI18n from '@/i18n/init';

type Props = {
  children: ReactNode;
};

const AppBoundary = ({ children }: Props) => {
  const {
    data: { language },
  } = useUserPreferences();

  useEffect(() => {
    (async () => {
      void initI18n(language);
    })();
  }, [language]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default AppBoundary;
