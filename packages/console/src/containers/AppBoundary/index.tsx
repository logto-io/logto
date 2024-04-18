import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import useUserPreferences from '@/hooks/use-user-preferences';

type Props = {
  readonly children: ReactNode;
};

function AppBoundary({ children }: Props) {
  const {
    data: { language },
  } = useUserPreferences();
  const { i18n } = useTranslation();

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [i18n, language]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default AppBoundary;
