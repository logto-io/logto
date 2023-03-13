import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import NotFoundDarkImage from '@/assets/images/not-found-dark.svg';
import NotFoundImage from '@/assets/images/not-found.svg';
import Card from '@/components/Card';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { Theme } from '@/types/theme';

import * as styles from './index.module.scss';

const NotFound = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { theme } = useContext(AppThemeContext);

  return (
    <div className={styles.container}>
      <Card className={styles.content}>
        {theme === Theme.LightMode ? <NotFoundImage /> : <NotFoundDarkImage />}
        <div className={styles.message}>{t('errors.page_not_found')}</div>
      </Card>
    </div>
  );
};

export default NotFound;
