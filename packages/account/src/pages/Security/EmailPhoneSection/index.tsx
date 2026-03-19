import { AccountCenterControlValue } from '@logto/schemas';
import { formatToInternationalPhoneNumber } from '@logto/shared/universal';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import EmailIcon from '@ac/assets/icons/email.svg?react';
import PhoneIcon from '@ac/assets/icons/phone.svg?react';
import { emailRoute, phoneRoute } from '@ac/constants/routes';
import { getRedirectUrl, setRedirectUrl } from '@ac/utils/account-center-route';
import { getEditFlowRedirectUrl } from '@ac/utils/edit-flow-redirect';

import styles from './index.module.scss';

const EmailPhoneSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo, accountCenterSettings } = useContext(PageContext);

  const emailControl = accountCenterSettings?.fields.email;
  const phoneControl = accountCenterSettings?.fields.phone;

  const showEmail = emailControl && emailControl !== AccountCenterControlValue.Off;
  const showPhone = phoneControl && phoneControl !== AccountCenterControlValue.Off;

  if (!showEmail && !showPhone) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t('account_center.security.email_phone')}</div>
      <div className={styles.card}>
        {showEmail && (
          <div className={styles.row}>
            <div className={styles.info}>
              <div className={styles.name}>
                <EmailIcon className={styles.icon} />
                {t('account_center.security.email')}
              </div>
              <div className={styles.value}>
                {userInfo?.primaryEmail ?? t('account_center.security.not_set')}
              </div>
            </div>
            {emailControl === AccountCenterControlValue.Edit && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.changeButton}
                  onClick={() => {
                    setRedirectUrl(getEditFlowRedirectUrl(getRedirectUrl(), window.location.href));
                    navigate(emailRoute);
                  }}
                >
                  {userInfo?.primaryEmail
                    ? t('account_center.security.change')
                    : t('account_center.security.add')}
                </button>
              </div>
            )}
          </div>
        )}
        {showPhone && (
          <div className={styles.row}>
            <div className={styles.info}>
              <div className={styles.name}>
                <PhoneIcon className={styles.icon} />
                {t('account_center.security.phone')}
              </div>
              <div className={styles.value}>
                {userInfo?.primaryPhone
                  ? formatToInternationalPhoneNumber(userInfo.primaryPhone)
                  : t('account_center.security.not_set')}
              </div>
            </div>
            {phoneControl === AccountCenterControlValue.Edit && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.changeButton}
                  onClick={() => {
                    setRedirectUrl(getEditFlowRedirectUrl(getRedirectUrl(), window.location.href));
                    navigate(phoneRoute);
                  }}
                >
                  {userInfo?.primaryPhone
                    ? t('account_center.security.change')
                    : t('account_center.security.add')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailPhoneSection;
