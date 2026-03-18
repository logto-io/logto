import { AccountCenterControlValue } from '@logto/schemas';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { usernameRoute } from '@ac/constants/routes';

import styles from './index.module.scss';

const UsernameSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo, accountCenterSettings } = useContext(PageContext);

  const usernameControl = accountCenterSettings?.fields.username;

  if (!usernameControl || usernameControl === AccountCenterControlValue.Off) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t('input.username')}</div>
      <div className={styles.card}>
        <div className={styles.row}>
          <div className={styles.info}>
            <div className={styles.name}>{t('input.username')}</div>
            <div className={styles.value}>{userInfo?.username ?? '-'}</div>
          </div>
          {usernameControl === AccountCenterControlValue.Edit && (
            <button
              type="button"
              className={styles.changeButton}
              onClick={() => {
                navigate(usernameRoute);
              }}
            >
              {t('account_center.security.change')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsernameSection;
