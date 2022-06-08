import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Failed from './Failed';
import Success from './Success';
import * as styles from './index.module.scss';

type Props = {
  isSuccess: boolean;
};

const EventIcon = ({ isSuccess }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div>
      <div className={classNames(styles.icon, isSuccess ? styles.success : styles.fail)}>
        {isSuccess ? <Success /> : <Failed />}
      </div>
      <div className={styles.label}>
        {t(isSuccess ? 'log_details.success' : 'log_details.failed')}
      </div>
    </div>
  );
};

export default EventIcon;
