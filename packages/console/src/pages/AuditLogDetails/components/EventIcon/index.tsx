import { useTranslation } from 'react-i18next';

import Failed from '@/icons/Failed';
import Success from '@/icons/Success';

import * as styles from './index.module.scss';

type Props = {
  isSuccess: boolean;
};

const EventIcon = ({ isSuccess }: Props) => {
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
};

export default EventIcon;
