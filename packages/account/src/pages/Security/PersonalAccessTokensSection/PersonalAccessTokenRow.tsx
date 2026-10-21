import type { AccountPersonalAccessTokenResponse } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

type Props = {
  readonly token: AccountPersonalAccessTokenResponse;
  readonly isEditable: boolean;
  readonly onRename: () => void;
  readonly onRevoke: () => void;
};

const PersonalAccessTokenRow = ({ token, isEditable, onRename, onRevoke }: Props) => {
  const { t, i18n } = useTranslation();
  const { name, createdAt, expiresAt } = token;
  const isExpired = expiresAt !== null && expiresAt <= Date.now();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [i18n.language]
  );

  return (
    <div className={classNames(styles.row, isExpired && styles.expired)}>
      <div className={styles.tokenInfo}>
        <div className={styles.tokenTitleLine}>
          <div className={styles.tokenTitle}>{name}</div>
        </div>
        <div className={styles.meta}>
          {t('account_center.security.personal_access_tokens.created_at', {
            date: dateFormatter.format(createdAt),
          })}
        </div>
      </div>
      <div className={styles.tokenDetails}>
        <div className={styles.tokenDetailsColumn}>
          {expiresAt === null ? (
            <>
              <div className={styles.expiry}>
                {t('account_center.security.personal_access_tokens.never_expires')}
              </div>
              <div className={styles.warningMeta}>
                {t('account_center.security.personal_access_tokens.never_expires_warning')}
              </div>
            </>
          ) : (
            <div className={styles.expiry}>
              {t(
                isExpired
                  ? 'account_center.security.personal_access_tokens.expired_on'
                  : 'account_center.security.personal_access_tokens.expires_on',
                {
                  date: dateFormatter.format(expiresAt),
                }
              )}
            </div>
          )}
        </div>
        {isExpired && (
          <span className={styles.expiredTag}>
            {t('account_center.security.personal_access_tokens.expired')}
          </span>
        )}
      </div>
      {isEditable && (
        <div className={styles.actions}>
          <button type="button" className={styles.actionButton} onClick={onRename}>
            {t('account_center.security.personal_access_tokens.rename')}
          </button>
          <button type="button" className={styles.removeButton} onClick={onRevoke}>
            {t('account_center.security.personal_access_tokens.revoke')}
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalAccessTokenRow;
