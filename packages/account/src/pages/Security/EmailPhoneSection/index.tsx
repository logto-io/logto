import { AccountCenterControlValue } from '@logto/schemas';
import { formatToInternationalPhoneNumber } from '@logto/shared/universal';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { deletePrimaryEmail, deletePrimaryPhone } from '@ac/apis/account';
import EmailIcon from '@ac/assets/icons/email.svg?react';
import PhoneIcon from '@ac/assets/icons/phone.svg?react';
import ConfirmModal from '@ac/components/ConfirmModal';
import { emailRoute, verifiedActionRoute, phoneRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { sessionStorage } from '@ac/utils/session-storage';

import styles from './index.module.scss';

type RemoveType = 'email' | 'phone';

const EmailPhoneSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    userInfo,
    accountCenterSettings,
    verificationId,
    setVerificationId,
    refreshUserInfo,
    setToast,
  } = useContext(PageContext);
  const handleError = useErrorHandler();
  const deletePrimaryEmailApi = useApi(deletePrimaryEmail);
  const deletePrimaryPhoneApi = useApi(deletePrimaryPhone);

  const [pendingRemoveType, setPendingRemoveType] = useState<RemoveType>();

  const emailControl = accountCenterSettings?.fields.email;
  const phoneControl = accountCenterSettings?.fields.phone;

  const showEmail = emailControl && emailControl !== AccountCenterControlValue.Off;
  const showPhone = phoneControl && phoneControl !== AccountCenterControlValue.Off;

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const handleRemoveConfirm = useCallback(async () => {
    if (!pendingRemoveType) {
      return;
    }

    setPendingRemoveType(undefined);

    const deleteApi = pendingRemoveType === 'email' ? deletePrimaryEmailApi : deletePrimaryPhoneApi;

    if (verificationId) {
      const [error] = await deleteApi(verificationId);

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }

      await refreshUserInfo();
      setToast(
        t(
          pendingRemoveType === 'email'
            ? 'account_center.security.email_removed'
            : 'account_center.security.phone_removed'
        )
      );
      return;
    }

    sessionStorage.setPendingVerifiedAction(
      pendingRemoveType === 'email' ? 'remove-email' : 'remove-phone'
    );
    navigateTo(verifiedActionRoute);
  }, [
    pendingRemoveType,
    verificationId,
    deletePrimaryEmailApi,
    deletePrimaryPhoneApi,
    handleError,
    setVerificationId,
    setToast,
    t,
    refreshUserInfo,
    navigateTo,
  ]);

  if (!showEmail && !showPhone) {
    return null;
  }

  return (
    <>
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
                      navigateTo(emailRoute);
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
                      navigateTo(phoneRoute);
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
      </div>
      <ConfirmModal
        isOpen={pendingRemoveType !== undefined}
        title={
          pendingRemoveType === 'email'
            ? 'account_center.security.remove_email_confirmation_title'
            : 'account_center.security.remove_phone_confirmation_title'
        }
        confirmText="account_center.security.remove"
        confirmButtonType="danger"
        cancelText="action.cancel"
        onConfirm={() => {
          void handleRemoveConfirm();
        }}
        onCancel={() => {
          setPendingRemoveType(undefined);
        }}
      >
        {t(
          pendingRemoveType === 'email'
            ? 'account_center.security.remove_email_confirmation_description'
            : 'account_center.security.remove_phone_confirmation_description'
        )}
      </ConfirmModal>
    </>
  );
};

export default EmailPhoneSection;
