import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';
import { formatTimestamp, type GrantedAppRow } from './utils';

type GrantRowProps = {
  readonly app: GrantedAppRow;
  readonly isEditable: boolean;
  readonly isRemoving: boolean;
  readonly onRevoke?: () => void;
};

const GrantRow = ({ app, isEditable, isRemoving, onRevoke }: GrantRowProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className={classNames(styles.row, layoutClassNames.row)}>
      <div className={styles.sessionInfo}>
        <div className={styles.deviceName}>{app.applicationName}</div>
        <div className={styles.meta}>
          {t('account_center.sessions.granted_at', {
            date: formatTimestamp(app.iat, i18n.language),
          })}
        </div>
      </div>
      <div className={styles.actions}>
        {isEditable && onRevoke && (
          <button
            type="button"
            className={styles.revokeButton}
            disabled={isRemoving}
            onClick={onRevoke}
          >
            {t('account_center.sessions.revoke_grant')}
          </button>
        )}
      </div>
    </div>
  );
};

export default GrantRow;
