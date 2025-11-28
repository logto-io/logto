import { useLogto } from '@logto/react';
import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { updatePrimaryEmail } from '@ac/apis/account';
import { verifyEmailVerificationCode } from '@ac/apis/verification';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { updateSuccessRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';

import EmailSendStep from './EmailSendStep';
import EmailVerifyStep from './EmailVerifyStep';

const Email = () => {
  const { t } = useTranslation();
  const { getAccessToken } = useLogto();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, verificationId, setToast, setVerificationId } =
    useContext(PageContext);
  const [email, setEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string>();
  const [pendingVerificationRecordId, setPendingVerificationRecordId] = useState<string>();
  const [verifyResetSignal, setVerifyResetSignal] = useState(0);
  const verifyCodeRequest = useApi(verifyEmailVerificationCode);
  const bindEmailRequest = useApi(updatePrimaryEmail);
  const handleError = useErrorHandler();

  const resetFlow = useCallback((shouldClearEmail = false) => {
    setPendingEmail(undefined);
    setPendingVerificationRecordId(undefined);

    if (shouldClearEmail) {
      setEmail('');
    }
  }, []);

  const handleVerifyAndBind = useCallback(
    async (code: string) => {
      if (!pendingEmail || !pendingVerificationRecordId || loading || !verificationId) {
        return;
      }

      const accessToken = await getAccessToken();

      if (!accessToken) {
        setToast(t('account_center.email_verification.error_verify_failed'));
        return;
      }

      const [verifyError, verifyResult] = await verifyCodeRequest(accessToken, {
        verificationRecordId: pendingVerificationRecordId,
        code,
        email: pendingEmail,
      });

      if (verifyError || !verifyResult) {
        setVerifyResetSignal((current) => current + 1);
        await handleError(verifyError ?? new Error('Failed to verify email code.'), {
          'verification_code.not_found': () => {
            setToast(t('account_center.email_verification.error_invalid_code'));
          },
          'verification_record.not_found': () => {
            resetFlow(true);
            setToast(t('account_center.email_verification.error_invalid_code'));
          },
          'verification_code.email_mismatch': () => {
            setToast(t('account_center.email_verification.error_invalid_code'));
          },
          'verification_code.code_mismatch': () => {
            setToast(t('account_center.email_verification.error_invalid_code'));
          },
          'verification_code.expired': () => {
            setToast(t('account_center.email_verification.error_invalid_code'));
          },
          'verification_code.exceed_max_try': () => {
            setToast(t('account_center.email_verification.error_invalid_code'));
          },
        });
        return;
      }

      const [bindError] = await bindEmailRequest(accessToken, verificationId, {
        email: pendingEmail,
        newIdentifierVerificationRecordId: verifyResult.verificationRecordId,
      });

      if (bindError) {
        await handleError(bindError, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            resetFlow(true);
            setToast(t('account_center.email.verification_required'));
          },
        });
        return;
      }

      void navigate(updateSuccessRoute, { replace: true });
    },
    [
      bindEmailRequest,
      getAccessToken,
      handleError,
      loading,
      navigate,
      pendingEmail,
      pendingVerificationRecordId,
      resetFlow,
      setToast,
      setVerificationId,
      t,
      verificationId,
      verifyCodeRequest,
    ]
  );

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.email !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  return !pendingEmail || !pendingVerificationRecordId ? (
    <EmailSendStep
      email={email}
      onCodeSent={(value, recordId) => {
        setEmail(value);
        setPendingEmail(value);
        setPendingVerificationRecordId(recordId);
      }}
    />
  ) : (
    <EmailVerifyStep
      pendingEmail={pendingEmail}
      verificationRecordId={pendingVerificationRecordId}
      resetSignal={verifyResetSignal}
      onResent={(recordId) => {
        setPendingVerificationRecordId(recordId);
      }}
      onSubmit={(code) => {
        void handleVerifyAndBind(code);
      }}
      onBack={() => {
        resetFlow(true);
      }}
      onInvalidCode={() => {
        setToast(t('error.invalid_passcode'));
      }}
    />
  );
};

export default Email;
