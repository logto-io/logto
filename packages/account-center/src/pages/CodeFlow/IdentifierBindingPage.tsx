import type { AccountCenter, SignInIdentifier } from '@logto/schemas';
import { AccountCenterControlValue } from '@logto/schemas';
import { type TFuncKey } from 'i18next';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';

import IdentifierSendStep, { type IdentifierLabelKey } from './IdentifierSendStep';
import IdentifierVerifyStep from './IdentifierVerifyStep';

type ErrorState = {
  sendError?: string;
  verifyError?: string;
};

type AccountCenterField = keyof AccountCenter['fields'];

type IdentifierBindingPageProps<VerifyPayload, BindPayload> = {
  readonly identifierType: SignInIdentifier.Email | SignInIdentifier.Phone;
  readonly accountField: AccountCenterField;
  readonly sendStep: {
    titleKey: TFuncKey;
    descriptionKey: TFuncKey;
    inputLabelKey: IdentifierLabelKey;
    inputName: string;
  };
  readonly verifyStep: {
    titleKey: TFuncKey;
    descriptionKey: TFuncKey;
    descriptionPropsBuilder: (identifier: string) => Record<string, string>;
    codeInputName: string;
  };
  readonly mismatchErrorCode: string;
  readonly sendCode: (
    accessToken: string,
    identifier: string
  ) => Promise<{
    verificationRecordId: string;
    expiresAt: string;
  }>;
  readonly verifyCode: (
    accessToken: string,
    payload: VerifyPayload
  ) => Promise<{
    verificationRecordId: string;
  }>;
  readonly bindIdentifier: (
    accessToken: string,
    verificationRecordId: string,
    payload: BindPayload
  ) => Promise<unknown>;
  readonly buildVerifyPayload: (
    identifier: string,
    verificationRecordId: string,
    code: string
  ) => VerifyPayload;
  readonly buildBindPayload: (identifier: string, verificationRecordId: string) => BindPayload;
  readonly successRedirect: string;
  readonly initialValue?: string;
};

const IdentifierBindingPage = <VerifyPayload, BindPayload>({
  identifierType,
  accountField,
  sendStep,
  verifyStep,
  mismatchErrorCode,
  sendCode,
  verifyCode,
  bindIdentifier,
  buildVerifyPayload,
  buildBindPayload,
  successRedirect,
  initialValue = '',
}: IdentifierBindingPageProps<VerifyPayload, BindPayload>) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, verificationId, setToast, setVerificationId } =
    useContext(PageContext);
  const [identifier, setIdentifier] = useState(initialValue);
  const [pendingIdentifier, setPendingIdentifier] = useState<string>();
  const [pendingVerificationRecordId, setPendingVerificationRecordId] = useState<string>();
  const [verifyResetSignal, setVerifyResetSignal] = useState(0);
  const [errorState, setErrorState] = useState<ErrorState>({});
  const verifyCodeRequest = useApi(verifyCode);
  const bindIdentifierRequest = useApi(bindIdentifier);
  const handleError = useErrorHandler();

  const clearSendError = useCallback(() => {
    setErrorState((current) => ({ ...current, sendError: undefined }));
  }, []);

  const clearVerifyError = useCallback(() => {
    setErrorState((current) => ({ ...current, verifyError: undefined }));
  }, []);

  const resetFlow = useCallback((shouldClearIdentifier = false) => {
    setPendingIdentifier(undefined);
    setPendingVerificationRecordId(undefined);
    setErrorState({});

    if (shouldClearIdentifier) {
      setIdentifier('');
    }
  }, []);

  const invalidCodeErrorCodes = useMemo(
    () => [
      'verification_code.not_found',
      mismatchErrorCode,
      'verification_code.code_mismatch',
      'verification_code.expired',
      'verification_code.exceed_max_try',
    ],
    [mismatchErrorCode]
  );

  const resetFlowErrorCodes = useMemo(() => ['verification_record.not_found'], []);

  const handleVerifyError = useCallback(
    async (error: unknown) => {
      const invalidHandlers = Object.fromEntries(
        invalidCodeErrorCodes.map((code) => [
          code,
          async () => {
            setVerifyResetSignal((current) => current + 1);
            setErrorState((current) => ({
              ...current,
              verifyError: t('account_center.verification.error_invalid_code'),
            }));
          },
        ])
      );

      const resetHandlers = Object.fromEntries(
        resetFlowErrorCodes.map((code) => [
          code,
          async () => {
            resetFlow(true);
            setErrorState((current) => ({
              ...current,
              sendError: t('account_center.verification.error_invalid_code'),
            }));
          },
        ])
      );

      await handleError(error ?? new Error(t('account_center.verification.error_verify_failed')), {
        ...invalidHandlers,
        ...resetHandlers,
      });
    },
    [handleError, invalidCodeErrorCodes, resetFlow, resetFlowErrorCodes, t]
  );

  const handleVerifyAndBind = useCallback(
    async (code: string) => {
      clearVerifyError();

      if (!pendingIdentifier || !pendingVerificationRecordId || loading || !verificationId) {
        return;
      }

      const [verifyError, verifyResult] = await verifyCodeRequest(
        buildVerifyPayload(pendingIdentifier, pendingVerificationRecordId, code)
      );

      if (verifyError || !verifyResult) {
        await handleVerifyError(verifyError);
        return;
      }

      const [bindError] = await bindIdentifierRequest(
        verificationId,
        buildBindPayload(pendingIdentifier, verifyResult.verificationRecordId)
      );

      if (bindError) {
        await handleError(bindError, {
          // This is a global error (session expired) that requires re-verification, so we use toast
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            resetFlow(true);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }

      void navigate(successRedirect, { replace: true });
    },
    [
      bindIdentifierRequest,
      buildBindPayload,
      buildVerifyPayload,
      clearVerifyError,
      handleError,
      handleVerifyError,
      loading,
      navigate,
      pendingIdentifier,
      pendingVerificationRecordId,
      resetFlow,
      setToast,
      setVerificationId,
      successRedirect,
      t,
      verificationId,
      verifyCodeRequest,
    ]
  );

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields[accountField] !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  return !pendingIdentifier || !pendingVerificationRecordId ? (
    <IdentifierSendStep
      identifierType={identifierType}
      name={sendStep.inputName}
      labelKey={sendStep.inputLabelKey}
      titleKey={sendStep.titleKey}
      descriptionKey={sendStep.descriptionKey}
      value={identifier}
      errorMessage={errorState.sendError}
      clearErrorMessage={clearSendError}
      sendCode={sendCode}
      onCodeSent={(value, recordId) => {
        setIdentifier(value);
        setPendingIdentifier(value);
        setPendingVerificationRecordId(recordId);
      }}
      onSendFailed={(message) => {
        setErrorState((current) => ({ ...current, sendError: message }));
      }}
    />
  ) : (
    <IdentifierVerifyStep
      identifier={pendingIdentifier}
      verificationRecordId={pendingVerificationRecordId}
      codeInputName={verifyStep.codeInputName}
      translation={{
        titleKey: verifyStep.titleKey,
        descriptionKey: verifyStep.descriptionKey,
        descriptionProps: verifyStep.descriptionPropsBuilder(pendingIdentifier),
      }}
      errorMessage={errorState.verifyError}
      clearErrorMessage={clearVerifyError}
      sendCode={sendCode}
      resetSignal={verifyResetSignal}
      onResent={(recordId) => {
        setPendingVerificationRecordId(recordId);
        clearVerifyError();
      }}
      onResendFailed={(message) => {
        setErrorState((current) => ({ ...current, verifyError: message }));
      }}
      onSubmit={(value) => {
        void handleVerifyAndBind(value);
      }}
      onBack={() => {
        resetFlow(true);
      }}
      onInvalidCode={(message) => {
        setErrorState((current) => ({ ...current, verifyError: message }));
      }}
    />
  );
};

export default IdentifierBindingPage;
