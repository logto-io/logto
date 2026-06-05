import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';
import { getSessionDisplayInfo, formatTimestamp, type AccountSession } from './utils';

type SessionRowProps = {
  readonly session: AccountSession;
  readonly isEditable: boolean;
  readonly isCurrent?: boolean;
  readonly onRevoke?: () => void;
};

const SessionRow = ({ session, isEditable, isCurrent, onRevoke }: SessionRowProps) => {
  const { t } = useTranslation();

  const { name, location, ip } = getSessionDisplayInfo(session);
  const deviceName = name ?? '-';
  const signedInAt = formatTimestamp(session.payload.loginTs);

  const metaParts = [location, ip].filter(Boolean);
  const metaText = metaParts.length > 0 ? metaParts.join(' · ') : undefined;

  return (
    <div className={classNames(styles.row, layoutClassNames.row)}>
      <div className={styles.sessionInfo}>
        <div className={styles.deviceName}>{deviceName}</div>
        {metaText && <div className={styles.meta}>{metaText}</div>}
        <div className={styles.meta}>
          {t('account_center.sessions.signed_in_at', { date: signedInAt })}
        </div>
      </div>
      <div className={styles.actions}>
        {isCurrent ? (
          <span className={styles.currentTag}>
            <span className={styles.currentDot} />
            {t('account_center.sessions.current_session')}
          </span>
        ) : (
          isEditable &&
          onRevoke && (
            <button type="button" className={styles.revokeButton} onClick={onRevoke}>
              {t('account_center.sessions.revoke_session')}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default SessionRow;
