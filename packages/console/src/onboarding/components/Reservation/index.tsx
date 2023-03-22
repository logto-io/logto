import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Calendar from '@/assets/images/calendar.svg';
import Button from '@/components/Button';
import { reservationLink } from '@/onboarding/constants';
import { buildUrl } from '@/utils/url';

import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  reservationButtonTitle: AdminConsoleKey;
  reservationButtonIcon?: ReactNode;
  className?: string;
};

function Reservation({
  title,
  description,
  reservationButtonTitle,
  reservationButtonIcon,
  className,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.reservation, className)}>
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
        icon={reservationButtonIcon}
        onClick={() => {
          const bookLink = buildUrl(reservationLink, {
            // Note: month format is YYYY-MM
            month: new Date().toISOString().slice(0, 7),
          });

          window.open(bookLink, '_blank');
        }}
      />
    </div>
  );
}

export default Reservation;
