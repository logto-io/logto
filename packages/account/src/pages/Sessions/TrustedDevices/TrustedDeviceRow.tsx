import type { AccountTrustedDeviceResponse } from '@logto/schemas';
import { getDeviceDisplayInfo } from '@logto/shared/universal';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

type Props = {
  readonly trustedDevice: AccountTrustedDeviceResponse;
  readonly isEditable: boolean;
  readonly onRemove: () => void;
};

const TrustedDeviceRow = ({ trustedDevice, isEditable, onRemove }: Props) => {
  const { t, i18n } = useTranslation();
  const { id, userAgent, country, city, expiresAt, isCurrent } = trustedDevice;
  const { name, location } = getDeviceDisplayInfo({
    userAgent: userAgent ?? undefined,
    country: country ?? undefined,
    city: city ?? undefined,
  });
  const expiryDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [i18n.language]
  );

  return (
    <div className={styles.row}>
      <div className={styles.deviceInfo}>
        <div className={styles.deviceTitleLine}>
          <div className={styles.deviceTitle}>{name ?? id}</div>
          {isCurrent && (
            <span className={styles.currentTag}>
              <span className={styles.currentDot} />
              {t('account_center.sessions.trusted_devices.current_device')}
            </span>
          )}
        </div>
        <div className={styles.meta}>{id}</div>
      </div>
      <div className={styles.deviceDetails}>
        <div className={styles.expiry}>
          {t('account_center.sessions.trusted_devices.expires_on', {
            date: expiryDateFormatter.format(expiresAt),
          })}
        </div>
        <div className={styles.meta}>
          {location ?? t('account_center.sessions.trusted_devices.unknown_location')}
        </div>
      </div>
      {isEditable && (
        <button type="button" className={styles.removeButton} onClick={onRemove}>
          {t('account_center.sessions.trusted_devices.remove')}
        </button>
      )}
    </div>
  );
};

export default TrustedDeviceRow;
