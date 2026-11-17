import { type SignInIdentifier } from '@logto/schemas';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useTimer } from 'react-timer-hook';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { bindMfaByVerificationCode, sendPrimaryVerificationCode } from '@/apis/experience';
import TextLink from '@/components/TextLink';
import styles from '@/containers/MfaCodeVerification/index.module.scss';
import { timeRange } from '@/containers/MfaCodeVerification/use-resend-mfa-verification-code';
import useGeneralVerificationCodeErrorHandler from '@/containers/VerificationCode/use-general-verification-code-error-handler';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import useMfaSubmitErrorHandler from '@/hooks/use-mfa-submit-error-handler';
import useToast from '@/hooks/use-toast';
import Button from '@/shared/components/Button';
import VerificationCodeInput from '@/shared/components/VerificationCode';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

const codeLength = 6;

const isCodeReady = (code: string[]) => code.length === codeLength && code.every(Boolean);

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);
  return now;
};

type Props = {
  readonly identifierType: SignInIdentifier.Email | SignInIdentifier.Phone;
  readonly verificationId: string;
};

const ExistingIdentifierCodeVerification = ({ identifierType, verificationId }: Props) => {
  const { t } = useTranslation();
  const { setToast } = useToast();
  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const { setVerificationId } = useContext(UserInteractionContext);

  const [codeInput, setCodeInput] = useState<string[]>([]);
  const [inputErrorMessage, setInputErrorMessage] = useState<string>();
  const [currentVerificationId, setCurrentVerificationId] = useState(verificationId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentVerificationId(verificationId);
  }, [verificationId]);

  const asyncBindMfa = useApi(bindMfaByVerificationCode);
  const asyncResend = useApi(sendPrimaryVerificationCode);
  const submitErrorHandler = useMfaSubmitErrorHandler();
  const {
    errorMessage: generalErrorMessage,
    generalVerificationCodeErrorHandlers,
    clearErrorMessage,
  } = useGeneralVerificationCodeErrorHandler();

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const handleSubmit = useCallback(
    async (code: string[]) => {
      if (isSubmitting) {
        return;
      }

      setInputErrorMessage(undefined);
      setIsSubmitting(true);

      try {
        const [error, result] = await asyncBindMfa(
          currentVerificationId,
          code.join(''),
          identifierType
        );

        if (error) {
          await handleError(error, {
            ...generalVerificationCodeErrorHandlers,
            ...submitErrorHandler,
          });
          setCodeInput([]);
          setInputErrorMessage(undefined);
          return;
        }

        if (result?.redirectTo) {
          await redirectTo(result.redirectTo);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      asyncBindMfa,
      currentVerificationId,
      generalVerificationCodeErrorHandlers,
      handleError,
      identifierType,
      isSubmitting,
      redirectTo,
      submitErrorHandler,
    ]
  );

  const handleResend = useCallback(async () => {
    const [error, result] = await asyncResend(identifierType);

    if (error) {
      await handleError(error);
      return;
    }

    if (result) {
      setVerificationId(codeVerificationTypeMap[identifierType], result.verificationId);
      setCurrentVerificationId(result.verificationId);
      setToast(t('description.passcode_sent'));
      restart(getTimeout(), true);
    }
  }, [asyncResend, handleError, identifierType, restart, setToast, setVerificationId, t]);

  const errorMessage = inputErrorMessage ?? generalErrorMessage;

  return (
    <>
      <VerificationCodeInput
        name="mfaCode"
        value={codeInput}
        className={styles.codeInput}
        error={errorMessage}
        onChange={(code) => {
          setInputErrorMessage(undefined);
          clearErrorMessage();
          setCodeInput(code);
          if (isCodeReady(code)) {
            void handleSubmit(code);
          }
        }}
      />
      <div className={styles.message}>
        {isRunning ? (
          <Trans components={{ span: <span key="counter" /> }}>
            {t('description.resend_after_seconds', { seconds })}
          </Trans>
        ) : (
          <Trans
            components={{
              a: (
                <TextLink
                  className={styles.link}
                  onClick={async () => {
                    setInputErrorMessage(undefined);
                    clearErrorMessage();
                    setCodeInput([]);
                    await handleResend();
                  }}
                />
              ),
            }}
          >
            {t('description.resend_passcode')}
          </Trans>
        )}
      </div>
      <Button
        title="action.continue"
        type="primary"
        className={styles.continueButton}
        isLoading={isSubmitting}
        onClick={() => {
          if (!isCodeReady(codeInput)) {
            setInputErrorMessage(t('error.invalid_passcode'));
            return;
          }

          void handleSubmit(codeInput);
        }}
      />
    </>
  );
};

export default ExistingIdentifierCodeVerification;
