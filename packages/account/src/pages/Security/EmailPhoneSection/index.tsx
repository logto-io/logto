import { AccountCenterControlValue } from '@logto/schemas';
import { formatToInternationalPhoneNumber } from '@logto/shared/universal';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ConfirmModal from '@ac/components/ConfirmModal';
import EmailIcon from '@ac/assets/icons/email.svg?react';
import PhoneIcon from '@ac/assets/icons/phone.svg?react';
import {
  emailRemoveRoute,
  emailRoute,
  phoneRemoveRoute,
  phoneRoute,
} from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';

import styles from './index.module.scss';

const EmailPhoneSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo, accountCenterSettings } = useContext(PageContext);
  const [pendingRemoveType, setPendingRemoveType] = useState<'email' | 'phone' | undefined>();

  const emailControl = accountCenterSettings?.fields.email;
  const phoneControl = accountCenterSettings?.fields.phone;

  const showEmail = emailControl && emailControl !== AccountCenterControlValue.Off;
  const showPhone = phoneControl && phoneControl !== AccountCenterControlValue.Off;

  const currentPageUrl = `${window.location.origin}${window.location.pathname}`;

  if (!showEmail && !showPhone) {
    return null;
  }

  const handleRemoveConfirm = () => {
    const route = pendingRemoveType === 'email' ? emailRemoveRoute : phoneRemoveRoute;
    setPendingReturn(getPendingReturn() ?? currentPageUrl);
    navigate(route);
    setPendingRemoveType(undefined);
  };

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
                    setPendingReturn(getPendingReturn() ?? currentPageUrl);
                    navigate(emailRoute);
                  }}
                >
                  {userInfo?.primaryEmail
                    ? t('account_center.security.change')
                    : t('account_center.security.add')}
                </button>
                {userInfo?.primaryEmail && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setPendingRemoveType('email');
                    }}
                  >
                    {t('account_center.security.remove')}
                  </button>
                )}
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
                    setPendingReturn(getPendingReturn() ?? currentPageUrl);
                    navigate(phoneRoute);
                  }}
                >
                  {userInfo?.primaryPhone
                    ? t('account_center.security.change')
                    : t('account_center.security.add')}
                </button>
                {userInfo?.primaryPhone && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => {
                      setPendingRemoveType('phone');
                    }}
                  >
                    {t('account_center.security.remove')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {pendingRemoveType && (
        <ConfirmModal
          isOpen
          title="action.remove"
          confirmText="action.remove"
          confirmButtonType="danger"
          onCancel={() => {
            setPendingRemoveType(undefined);
          }}
          onConfirm={handleRemoveConfirm}
        >
          {pendingRemoveType === 'email'
            ? t('account_center.email.remove_confirmation_description')
            : t('account_center.phone.remove_confirmation_description')}
        </ConfirmModal>
      )}
    </div>
  );
};

export default EmailPhoneSection;
