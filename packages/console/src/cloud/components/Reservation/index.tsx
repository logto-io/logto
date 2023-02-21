import type { AdminConsoleKey } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

import Calendar from '@/assets/images/calendar.svg';
import Button from '@/components/Button';
import { buildUrl } from '@/utils/url';

import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  reservationButtonTitle: AdminConsoleKey;
};

const Reservation = ({ title, description, reservationButtonTitle }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.reservation}>
      <div className={styles.reservationInfo}>
        <Calendar className={styles.reservationIcon} />
        <div>
          <div className={styles.reservationTitle}>{t(title)}</div>
          <div className={styles.reservationDescription}>{t(description)}</div>
        </div>
      </div>
      <Button
        type="outline"
        title={reservationButtonTitle}
        onClick={() => {
          const bookLink = buildUrl('https://calendly.com/logto/30min', {
            // Note: month format is YYYY-MM
            month: new Date().toISOString().slice(0, 7),
          });

          window.open(bookLink, '_blank');
        }}
      />
    </div>
  );
};

export default Reservation;
