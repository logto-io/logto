import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { deletePrimaryEmail, deletePrimaryPhone } from '@ac/apis/account';
import { updateMfaSettings } from '@ac/apis/mfa';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { sessionStorage } from '@ac/utils/session-storage';
import type { PendingVerifiedAction } from '@ac/utils/session-storage';

const VerifiedAction = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId, setVerificationId, setToast, refreshUserInfo } =
    useContext(PageContext);
  const updateMfaSettingsApi = useApi(updateMfaSettings);
  const deletePrimaryEmailApi = useApi(deletePrimaryEmail);
  const deletePrimaryPhoneApi = useApi(deletePrimaryPhone);
  const handleError = useErrorHandler();
  const [action, setAction] = useState<PendingVerifiedAction>();

  useEffect(() => {
    const storedAction = sessionStorage.getPendingVerifiedAction();
    if (storedAction) {
      setAction(storedAction);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!verificationId || !action) {
      return;
    }

    const onPermissionDenied = async () => {
      setVerificationId(undefined);
      setToast(t('account_center.verification.verification_required'));
    };

    switch (action) {
      case 'enable-mfa':
      case 'disable-mfa': {
        // Enable 2-step → skipMfaOnSignIn: false; Disable 2-step → skipMfaOnSignIn: true
        const skipMfaOnSignIn = action === 'disable-mfa';

        const [error, result] = await updateMfaSettingsApi(verificationId, { skipMfaOnSignIn });

        if (error) {
          await handleError(error, {
            'verification_record.permission_denied': onPermissionDenied,
          });
          return;
        }

        if (result) {
          sessionStorage.clearPendingVerifiedAction();
          navigate(-1);
        }
        return;
      }
      case 'remove-email': {
        const [error] = await deletePrimaryEmailApi(verificationId);

        if (error) {
          await handleError(error, {
            'verification_record.permission_denied': onPermissionDenied,
          });
          return;
        }

        sessionStorage.clearPendingVerifiedAction();
        await refreshUserInfo();
        setToast(t('account_center.security.email_removed'));
        navigate(-1);
        return;
      }
      case 'remove-phone': {
        const [error] = await deletePrimaryPhoneApi(verificationId);

        if (error) {
          await handleError(error, {
            'verification_record.permission_denied': onPermissionDenied,
          });
          return;
        }

        sessionStorage.clearPendingVerifiedAction();
        await refreshUserInfo();
        setToast(t('account_center.security.phone_removed'));
        navigate(-1);
      }
    }
  }, [
    action,
    deletePrimaryEmailApi,
    deletePrimaryPhoneApi,
    handleError,
    navigate,
    refreshUserInfo,
    setToast,
    setVerificationId,
    t,
    updateMfaSettingsApi,
    verificationId,
  ]);

  useEffect(() => {
    if (verificationId && action) {
      void handleConfirm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationId, action]);

  const isActionAllowed = useMemo(() => {
    if (!accountCenterSettings?.enabled) {
      return false;
    }
    switch (action) {
      case 'enable-mfa':
      case 'disable-mfa': {
        return accountCenterSettings.fields.mfa === AccountCenterControlValue.Edit;
      }
      case 'remove-email': {
        return accountCenterSettings.fields.email === AccountCenterControlValue.Edit;
      }
      case 'remove-phone': {
        return accountCenterSettings.fields.phone === AccountCenterControlValue.Edit;
      }
      default: {
        return false;
      }
    }
  }, [accountCenterSettings, action]);

  if (!isActionAllowed) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!action) {
    return <ErrorPage titleKey="error.something_went_wrong" messageKey="error.invalid_session" />;
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  // API call is in progress via useEffect
  return null;
};

export default VerifiedAction;
