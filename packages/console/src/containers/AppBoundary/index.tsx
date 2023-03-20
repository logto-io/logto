import type { ReactNode } from 'react';
import { useEffect } from 'react';

import AppLoading from '@/components/AppLoading';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import useUserPreferences from '@/hooks/use-user-preferences';
import initI18n from '@/i18n/init';

type Props = {
  children: ReactNode;
};

const AppBoundary = ({ children }: Props) => {
  const {
    data: { language },
  } = useUserPreferences();

  const { isLoading: isUserAssetsServiceLoading } = useUserAssetsService();

  useEffect(() => {
    (async () => {
      void initI18n(language);
    })();
  }, [language]);

  if (isUserAssetsServiceLoading) {
    return <AppLoading />;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default AppBoundary;
