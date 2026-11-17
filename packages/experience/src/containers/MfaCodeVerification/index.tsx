import type { SignInIdentifier } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type sendMfaVerificationCode, type verifyMfaByVerificationCode } from '@/apis/experience';
import TextLink from '@/components/TextLink';
import Button from '@/shared/components/Button';
import VerificationCodeInput from '@/shared/components/VerificationCode';

import styles from './index.module.scss';
import useMfaCodeVerification from './use-mfa-code-verification';
import useResendMfaVerificationCode from './use-resend-mfa-verification-code';

const codeLength = 6;

const isCodeReady = (code: string[]) => {
  return code.length === codeLength && code.every(Boolean);
};

type Props = {
  readonly identifierType: SignInIdentifier.Email | SignInIdentifier.Phone;
  readonly verificationId: string;
  readonly verifyCode?: typeof verifyMfaByVerificationCode;
  readonly resendCode?: typeof sendMfaVerificationCode;
};

const MfaCodeVerification = ({ identifierType, verificationId, verifyCode, resendCode }: Props) => {
  const { t } = useTranslation();
  const [codeInput, setCodeInput] = useState<string[]>([]);
  const [inputErrorMessage, setInputErrorMessage] = useState<string>();
  const [currentVerificationId, setCurrentVerificationId] = useState(verificationId);

  useEffect(() => {
    setCurrentVerificationId(verificationId);
  }, [verificationId]);

  const errorCallback = useCallback(() => {
    setCodeInput([]);
    setInputErrorMessage(undefined);
  }, []);

  const {
    errorMessage: submitErrorMessage,
    clearErrorMessage,
    onSubmit,
  } = useMfaCodeVerification(identifierType, currentVerificationId, errorCallback, verifyCode);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorMessage = inputErrorMessage ?? submitErrorMessage;

  const { seconds, isRunning, onResendVerificationCode } = useResendMfaVerificationCode(
    identifierType,
    resendCode
  );

  const handleSubmit = useCallback(
    async (code: string[]) => {
      if (isSubmitting) {
        return;
      }

      setInputErrorMessage(undefined);
      setIsSubmitting(true);

      try {
        await onSubmit(code.join(''));
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, isSubmitting]
  );

  return (
    <>
      <VerificationCodeInput
        name="mfaCode"
        value={codeInput}
        className={styles.codeInput}
        error={errorMessage}
        onChange={(code) => {
          setInputErrorMessage(undefined);
          clearErrorMessage?.();
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
                    clearErrorMessage?.();
                    setInputErrorMessage(undefined);
                    setCodeInput([]);
                    const newId = await onResendVerificationCode();
                    if (newId) {
                      setCurrentVerificationId(newId);
                    }
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

export default MfaCodeVerification;
