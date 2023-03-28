import { Theme } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import NotFoundDarkImage from '@/assets/images/not-found-dark.svg';
import NotFoundImage from '@/assets/images/not-found.svg';
import Card from '@/components/Card';
import PageMeta from '@/components/PageMeta';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

function NotFound() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const location = useLocation();

  return (
    <div className={styles.container}>
      {/* Don't track "not found" for the root path as it will be redirected. */}
      <PageMeta titleKey="errors.page_not_found" trackPageView={location.pathname !== '/'} />
      <Card className={styles.content}>
        {theme === Theme.Light ? <NotFoundImage /> : <NotFoundDarkImage />}
        <div className={styles.message}>{t('errors.page_not_found')}</div>
      </Card>
    </div>
  );
}

export default NotFound;
