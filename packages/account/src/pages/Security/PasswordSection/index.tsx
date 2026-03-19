import { AccountCenterControlValue } from '@logto/schemas';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import PasswordIcon from '@ac/assets/icons/password.svg?react';
import { passwordRoute } from '@ac/constants/routes';

import styles from './index.module.scss';

const PasswordSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo, accountCenterSettings } = useContext(PageContext);

  const passwordControl = accountCenterSettings?.fields.password;

  if (!passwordControl || passwordControl === AccountCenterControlValue.Off) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t('account_center.security.password')}</div>
      <div className={styles.card}>
        <div className={styles.row}>
          <div className={styles.info}>
            <div className={styles.name}>
              <PasswordIcon className={styles.icon} />
              {t('account_center.security.password')}
            </div>
            <div className={styles.value}>
              {userInfo?.hasPassword ? (
                <span className={styles.statusTag}>
                  <span className={styles.statusDot} />
                  {t('account_center.security.configured')}
                </span>
              ) : (
                <span className={styles.notConfigured}>
                  {t('account_center.security.not_configured')}
                </span>
              )}
            </div>
          </div>
          {passwordControl === AccountCenterControlValue.Edit && (
            <button
              type="button"
              className={styles.changeButton}
              onClick={() => {
                navigate(passwordRoute);
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

export default PasswordSection;
