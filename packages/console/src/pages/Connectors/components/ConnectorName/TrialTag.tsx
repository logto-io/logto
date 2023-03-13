import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/Tip';

import * as styles from './TrialTag.module.scss';

const TrialTag = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Tooltip isLineEllipsisDisabled content={<div>{t('connectors.connector_trial_tip')}</div>}>
      <div className={styles.trialTag}>{t('general.trial')}</div>
    </Tooltip>
  );
};

export default TrialTag;
