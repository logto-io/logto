import { AccountCenterControlValue } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { deleteUsername } from '@ac/apis/account';
import ConfirmModal from '@ac/components/ConfirmModal';
import { layoutClassNames } from '@ac/constants/layout';
import { usernameRoute, verifiedActionRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '@ac/hooks/use-step-up';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { sessionStorage } from '@ac/utils/session-storage';
import { consumePendingStepUpAction } from '@ac/utils/step-up';

import styles from './index.module.scss';

const UsernameSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo, accountCenterSettings, setVerificationId, refreshUserInfo, setToast } =
    useContext(PageContext);
  const { isReady: isIdentityProofReady, verificationId } = useIdentityProof();
  const requestStepUp = useStepUp();
  const handleError = useErrorHandler();
  const deleteUsernameApi = useApi(deleteUsername);

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const usernameControl = accountCenterSettings?.fields.username;
  const usernameValue = userInfo?.username;

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const removeUsername = useCallback(
    async (verifiedId: string | undefined, isResumed = false) => {
      const [error] = await deleteUsernameApi(verifiedId);

      if (error) {
        if (await requestStepUp(error, { type: 'remove-username' }, { isResumed })) {
          return;
        }

        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }

      await refreshUserInfo();
      setToast(t('account_center.security.username_removed'));
    },
    [deleteUsernameApi, handleError, refreshUserInfo, requestStepUp, setToast, setVerificationId, t]
  );

  const handleRemoveConfirm = useCallback(async () => {
    setIsRemoveModalOpen(false);

    if (isIdentityProofReady) {
      await removeUsername(verificationId);
      return;
    }

    sessionStorage.setPendingVerifiedAction('remove-username');
    navigateTo(verifiedActionRoute);
  }, [isIdentityProofReady, navigateTo, removeUsername, verificationId]);

  useEffect(() => {
    if (consumePendingStepUpAction(['remove-username'])) {
      void removeUsername(undefined, true);
    }
  }, [removeUsername]);

  useEffect(() => {
    if (!verificationId || sessionStorage.getPendingVerifiedAction() !== 'remove-username') {
      return;
    }

    sessionStorage.clearPendingVerifiedAction();
    void removeUsername(verificationId);
  }, [removeUsername, verificationId]);

  if (!usernameControl || usernameControl === AccountCenterControlValue.Off) {
    return null;
  }

  return (
    <>
      <div className={classNames(styles.section, layoutClassNames.section)}>
        <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
          {t('input.username')}
        </div>
        <div className={classNames(styles.card, layoutClassNames.card)}>
          <div className={classNames(styles.row, layoutClassNames.row)}>
            <div className={styles.topLine}>
              <div className={styles.name}>{t('input.username')}</div>
              {usernameControl === AccountCenterControlValue.Edit && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.changeButton}
                    onClick={() => {
                      navigateTo(usernameRoute);
                    }}
                  >
                    {usernameValue
                      ? t('account_center.security.change')
                      : t('account_center.security.add')}
                  </button>
                  {usernameValue && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => {
                        setIsRemoveModalOpen(true);
                      }}
                    >
                      {t('account_center.security.remove')}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className={classNames(styles.value, !usernameValue && styles.secondaryValue)}>
              {usernameValue ?? t('account_center.security.not_set')}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isRemoveModalOpen}
        title="account_center.security.remove_username_confirmation_title"
        confirmText="account_center.security.remove"
        confirmButtonType="danger"
        cancelText="action.cancel"
        onConfirm={() => {
          void handleRemoveConfirm();
        }}
        onCancel={() => {
          setIsRemoveModalOpen(false);
        }}
      >
        {t('account_center.security.remove_username_confirmation_description')}
      </ConfirmModal>
    </>
  );
};

export default UsernameSection;
