import { Theme } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import CongratsDark from '@/assets/images/congrats-dark.svg';
import Congrats from '@/assets/images/congrats.svg';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

function DevelopmentTenantNotification() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const Image = theme === Theme.Light ? Congrats : CongratsDark;

  return (
    <div className={styles.container}>
      <Image className={styles.image} />
      <div className={styles.content}>
        <div className={styles.title}>
          <Trans components={{ span: <span className={styles.highlight} /> }}>
            {t('tenants.notification.allow_pro_features_title')}
          </Trans>
        </div>
        <div className={styles.description}>
          <DynamicT forKey="tenants.notification.allow_pro_features_description" />
        </div>
      </div>
      <Button
        title="general.learn_more"
        type="outline"
        className={styles.button}
        size="large"
        onClick={() => {
          // Todo - PRD-591 @xiaoyijun navigate to related posts
        }}
      />
    </div>
  );
}

export default DevelopmentTenantNotification;
