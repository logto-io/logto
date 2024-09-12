import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import useTheme from '@/hooks/use-theme';
import useUserPreferences from '@/hooks/use-user-preferences';

type Props = {
  readonly children: ReactNode;
};

function AppBoundary({ children }: Props) {
  const {
    data: { language },
  } = useUserPreferences();
  const theme = useTheme();
  const { i18n } = useTranslation();

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [i18n, language]);

  return (
    <>
      <Helmet>
        <html lang={language} dir={i18n.dir()} data-theme={theme} />
      </Helmet>
      {children}
    </>
  );
}

export default AppBoundary;
