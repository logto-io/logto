import { useTranslation } from 'react-i18next';

import { logtoBlogLink } from '@/cloud/constants';
import TextLink from '@/components/TextLink';

import * as styles from './index.module.scss';

const Broadcast = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.broadcast}>
      <span>{t('cloud.broadcast')}</span>
      <TextLink href={logtoBlogLink} target="_blank" className={styles.link}>
        {t('general.learn_more')}
      </TextLink>
    </div>
  );
};

export default Broadcast;
