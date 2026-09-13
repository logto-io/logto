import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import TextLink from '@/components/TextLink';
import Button from '@/shared/components/Button';
import VerificationCodeInput, { defaultLength } from '@/shared/components/VerificationCode';
import { type VerificationCodeIdentifier } from '@/types';

import styles from './index.module.scss';
import useResendStepUpVerificationCode from './use-resend-step-up-verification-code';
import useStepUpCodeVerification from './use-step-up-code-verification';

const isCodeReady = (code: string[]) => code.length === defaultLength && code.every(Boolean);

type Props = {
  readonly identifierType: VerificationCodeIdentifier;
  readonly verificationId: string;
};

/**
 * The pinned-user code input, modeled on `MfaCodeVerification`: the code goes to an identifier
 * the server resolved, so the container takes its type and nothing else. There is no link back to
 * a password page or to another identifier — the method list is where the user switches.
 */
const StepUpCodeVerification = ({ identifierType, verificationId }: Props) => {
  const { t } = useTranslation();
  const [codeInput, setCodeInput] = useState<string[]>([]);
  const [inputErrorMessage, setInputErrorMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVerificationId, setCurrentVerificationId] = useState(verificationId);

  useEffect(() => {
    setCurrentVerificationId(verificationId);
  }, [verificationId]);

  const errorCallback = useCallback(() => {
    setCodeInput([]);
    setInputErrorMessage(undefined);
  }, []);

  const { errorMessage: submitErrorMessage, onSubmit } = useStepUpCodeVerification(
    identifierType,
    currentVerificationId,
    errorCallback
  );

  const { seconds, isRunning, onResendVerificationCode } =
    useResendStepUpVerificationCode(identifierType);

  const errorMessage = inputErrorMessage ?? submitErrorMessage;

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
        // Always reset, even if `onSubmit` throws, so the button does not spin forever.
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onSubmit]
  );

  return (
    <>
      <VerificationCodeInput
        name="passcode"
        value={codeInput}
        className={styles.codeInput}
        error={errorMessage}
        onChange={(code) => {
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
                    setCodeInput([]);

                    const resentVerificationId = await onResendVerificationCode();

                    if (resentVerificationId) {
                      setCurrentVerificationId(resentVerificationId);
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

export default StepUpCodeVerification;
