import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deletePrimaryEmail, deletePrimaryPhone } from '@ac/apis/account';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { emailSuccessRoute, phoneSuccessRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';

type Props = {
  readonly type: 'email' | 'phone';
};

const EmailPhoneRemoveFlow = ({ type }: Props) => {
  const navigate = useNavigate();
  const {
    setToast,
    refreshUserInfo,
    verificationId,
    setVerificationId,
  } = useContext(PageContext);

  const deletePrimaryEmailRequest = useApi(deletePrimaryEmail);
  const deletePrimaryPhoneRequest = useApi(deletePrimaryPhone);
  const handleError = useErrorHandler();
  const [startedFlowKey, setStartedFlowKey] = useState<string>();

  const resetVerification = useCallback(() => {
    setStartedFlowKey(undefined);
    setVerificationId(undefined);
    setToast('account_center.verification.verification_required');
  }, [setToast, setVerificationId]);

  const handleErrorWithReset = useCallback(
    async (error: unknown) => {
      await handleError(error, {
        'verification_record.permission_denied': resetVerification,
        global: async (requestError) => {
          setToast(requestError.message);
          navigate('/', { replace: true });
        },
      });
    },
    [handleError, navigate, resetVerification, setToast]
  );

  const handleRemoveSuccess = useCallback(async () => {
    await refreshUserInfo();
    const successRoute = type === 'email' ? emailSuccessRoute : phoneSuccessRoute;
    navigate(successRoute, { replace: true });
  }, [navigate, refreshUserInfo, type]);

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
      const deleteRequest = type === 'email' ? deletePrimaryEmailRequest : deletePrimaryPhoneRequest;
      const [error] = await deleteRequest(verificationId);

      if (error) {
        await handleErrorWithReset(error);
        return;
      }

      await handleRemoveSuccess();
    };

    void startRemoveFlow();
  }, [verificationId, type, startedFlowKey, deletePrimaryEmailRequest, deletePrimaryPhoneRequest, handleErrorWithReset, handleRemoveSuccess]);

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  return null;
};

export default EmailPhoneRemoveFlow;
