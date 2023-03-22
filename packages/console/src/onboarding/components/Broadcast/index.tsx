import { useTranslation } from 'react-i18next';

import TextLink from '@/components/TextLink';
import { aboutCloudPreviewLink } from '@/onboarding/constants';

import * as styles from './index.module.scss';

function Broadcast() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.broadcast}>
      <span>{t('cloud.broadcast')}</span>
      <TextLink href={aboutCloudPreviewLink} target="_blank" className={styles.link}>
        {t('general.learn_more')}
      </TextLink>
    </div>
  );
}

export default Broadcast;
