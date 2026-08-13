import { isCimdClientId } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import ExternalLinkIcon from '@ac/assets/icons/external-link.svg?react';
import { layoutClassNames } from '@ac/constants/layout';

import styles from './index.module.scss';
import { formatTimestamp, getDynamicAppDisplayName, type GrantedAppRow } from './utils';

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
        {/**
         * A dynamic app (CIMD) client is a URL identity with no applications row behind
         * it, so its consent-time snapshot name links to the client identifier URL (the
         * metadata document) — the user can inspect what they authorized before revoking.
         */}
        {isCimdClientId(app.applicationId) ? (
          <div className={styles.dynamicAppName}>
            <a
              className={styles.dynamicAppLink}
              href={app.applicationId}
              target="_blank"
              rel="noopener noreferrer"
              title={app.applicationId}
            >
              <span className={styles.dynamicAppLinkName}>
                {getDynamicAppDisplayName(app.applicationId, app.applicationName)}
              </span>
              <ExternalLinkIcon className={styles.dynamicAppLinkIcon} />
            </a>
            <span className={styles.dynamicAppTag}>{t('account_center.sessions.dynamic_app')}</span>
          </div>
        ) : (
          <div className={styles.deviceName}>{app.applicationName}</div>
        )}
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
