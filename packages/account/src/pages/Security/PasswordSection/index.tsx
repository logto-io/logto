import { AccountCenterControlValue } from '@logto/schemas';
import classNames from 'classnames';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import PasswordIcon from '@ac/assets/icons/password.svg?react';
import { layoutClassNames } from '@ac/constants/layout';
import { passwordRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { canOpenPasswordEditFlow } from '@ac/utils/security-page';

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
    <div className={classNames(styles.section, layoutClassNames.section)}>
      <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
        {t('account_center.security.password')}
      </div>
      <div className={classNames(styles.card, layoutClassNames.card)}>
        <div className={classNames(styles.row, layoutClassNames.row)}>
          <div className={styles.topLine}>
            <div className={styles.iconWrap}>
              <PasswordIcon className={styles.icon} />
            </div>
            {canOpenPasswordEditFlow(passwordControl, userInfo, accountCenterSettings.fields) && (
              <button
                type="button"
                className={styles.changeButton}
                onClick={() => {
                  setPendingReturn(getPendingReturn() ?? window.location.href);
                  navigate(passwordRoute);
                }}
              >
                {t('account_center.security.change')}
              </button>
            )}
          </div>
          <div className={styles.title}>{t('account_center.security.password')}</div>
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
      </div>
    </div>
  );
};

export default PasswordSection;
