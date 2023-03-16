import { Theme } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import NotFoundDarkImage from '@/assets/images/not-found-dark.svg';
import NotFoundImage from '@/assets/images/not-found.svg';
import Card from '@/components/Card';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

const NotFound = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();

  return (
    <div className={styles.container}>
      <Card className={styles.content}>
        {theme === Theme.Light ? <NotFoundImage /> : <NotFoundDarkImage />}
        <div className={styles.message}>{t('errors.page_not_found')}</div>
      </Card>
    </div>
  );
};

export default NotFound;
