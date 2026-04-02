import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { deletePrimaryEmail, deletePrimaryPhone } from '@ac/apis/account';
import ErrorPage from '@ac/components/ErrorPage';
import GlobalLoading from '@ac/components/GlobalLoading';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import { getPendingReturn, clearPendingReturn } from '@ac/utils/account-center-route';

type Props = {
  readonly type: 'email' | 'phone';
};

const EmailPhoneRemoveFlow = ({ type }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, setToast, refreshUserInfo, verificationId, setVerificationId } =
    useContext(PageContext);

  const deletePrimaryEmailRequest = useApi(deletePrimaryEmail);
  const deletePrimaryPhoneRequest = useApi(deletePrimaryPhone);
  const handleError = useErrorHandler();
  const [startedFlowKey, setStartedFlowKey] = useState<string>();

  const resetVerification = useCallback(() => {
    setStartedFlowKey(undefined);
    setVerificationId(undefined);
    setToast(t('account_center.verification.verification_required'));
  }, [setToast, setVerificationId, t]);

  const navigateBack = useCallback(() => {
    const pendingReturn = getPendingReturn();

    if (pendingReturn) {
      clearPendingReturn();
      window.location.assign(pendingReturn);
      return;
    }

    navigate('/', { replace: true });
  }, [navigate]);

  const handleErrorWithReset = useCallback(
    async (error: unknown) => {
      await handleError(error, {
        'verification_record.permission_denied': resetVerification,
        global: async (requestError) => {
          setToast(requestError.message);
          navigateBack();
        },
      });
    },
    [handleError, navigateBack, resetVerification, setToast]
  );

  const handleRemoveSuccess = useCallback(async () => {
    await refreshUserInfo();
    setToast(
      t('account_center.social.removed', {
        connector: t(
          type === 'email' ? 'account_center.security.email' : 'account_center.security.phone'
        ),
      })
    );
    navigateBack();
  }, [navigateBack, refreshUserInfo, setToast, t, type]);

  useEffect(() => {
    if (!verificationId) {
      if (startedFlowKey) {
        setStartedFlowKey(undefined);
      }
      return;
    }

    const flowKey = `${type}:${verificationId}`;

    if (flowKey === startedFlowKey) {
      return;
    }

    setStartedFlowKey(flowKey);

    const startRemoveFlow = async () => {
      const deleteRequest =
        type === 'email' ? deletePrimaryEmailRequest : deletePrimaryPhoneRequest;
      const [error] = await deleteRequest(verificationId);

      if (error) {
        await handleErrorWithReset(error);
        return;
      }

      await handleRemoveSuccess();
    };

    void startRemoveFlow();
  }, [
    verificationId,
    type,
    startedFlowKey,
    deletePrimaryEmailRequest,
    deletePrimaryPhoneRequest,
    handleErrorWithReset,
    handleRemoveSuccess,
  ]);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields[type] !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  return <GlobalLoading />;
};

export default EmailPhoneRemoveFlow;
