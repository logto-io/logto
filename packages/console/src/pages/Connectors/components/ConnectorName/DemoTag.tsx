import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/Tip';

import * as styles from './DemoTag.module.scss';

const DemoTag = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Tooltip content={<div>{t('connectors.connector_trial_tip')}</div>}>
      <div className={styles.tag}>{t('general.demo')}</div>
    </Tooltip>
  );
};

export default DemoTag;
