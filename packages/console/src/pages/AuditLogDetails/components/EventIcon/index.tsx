import { useTranslation } from 'react-i18next';

import Failed from '@/assets/icons/failed.svg';
import Success from '@/assets/icons/success.svg';

import * as styles from './index.module.scss';

type Props = {
  readonly isSuccess: boolean;
};

function EventIcon({ isSuccess }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div>
      <div className={isSuccess ? styles.success : styles.fail}>
        {isSuccess ? <Success className={styles.icon} /> : <Failed className={styles.icon} />}
      </div>
      <div className={styles.label}>
        {t(isSuccess ? 'log_details.success' : 'log_details.failed')}
      </div>
    </div>
  );
}

export default EventIcon;
