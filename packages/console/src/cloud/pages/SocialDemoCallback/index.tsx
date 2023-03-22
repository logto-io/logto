import { Theme } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import CongratsDark from '@/assets/images/congrats-dark.svg';
import Congrats from '@/assets/images/congrats.svg';
import Card from '@/components/Card';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

function SocialDemoCallback() {
  const theme = useTheme();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        {theme === Theme.Light ? <Congrats /> : <CongratsDark />}
        <div className={styles.title}>{t('cloud.socialCallback.title')}</div>
        <div className={styles.message}>{t('cloud.socialCallback.description')}</div>
      </Card>
    </div>
  );
}

export default SocialDemoCallback;
