import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { updateMfaSettings } from '@ac/apis/mfa';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { sessionStorage } from '@ac/utils/session-storage';

type MfaToggleAction = 'enable' | 'disable';

const MfaSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const updateMfaSettingsApi = useApi(updateMfaSettings);
  const handleError = useErrorHandler();
  const [action, setAction] = useState<MfaToggleAction>();

  useEffect(() => {
    const storedAction = sessionStorage.getMfaToggleAction();
    if (storedAction) {
      setAction(storedAction);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!verificationId || !action) {
      return;
    }

    // Enable 2-step → skipMfaOnSignIn: false; Disable 2-step → skipMfaOnSignIn: true
    const skipMfaOnSignIn = action === 'disable';

    const [error, result] = await updateMfaSettingsApi(verificationId, { skipMfaOnSignIn });

    if (error) {
      await handleError(error, {
        'verification_record.permission_denied': async () => {
          setVerificationId(undefined);
          setToast(t('account_center.verification.verification_required'));
        },
      });
      return;
    }

    if (result) {
      sessionStorage.clearMfaToggleAction();
      navigate(-1);
    }
  }, [
    action,
    handleError,
    navigate,
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

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.mfa !== AccountCenterControlValue.Edit
  ) {
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

export default MfaSettings;
