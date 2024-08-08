import { type VerificationCodeIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Button from '@/components/Button';
import TextLink from '@/components/TextLink';
import VerificationCodeInput, { defaultLength } from '@/components/VerificationCode';
import { UserFlow } from '@/types';

import PasswordSignInLink from './PasswordSignInLink';
import styles from './index.module.scss';
import useResendVerificationCode from './use-resend-verification-code';
import { getCodeVerificationHookByFlow } from './utils';

type Props = {
  readonly flow: UserFlow;
  readonly identifier: VerificationCodeIdentifier;
  readonly verificationId: string;
  readonly hasPasswordButton?: boolean;
  readonly className?: string;
};

const VerificationCode = ({
  flow,
  identifier,
  verificationId,
  className,
  hasPasswordButton,
}: Props) => {
  const [codeInput, setCodeInput] = useState<string[]>([]);
  const [inputErrorMessage, setInputErrorMessage] = useState<string>();

  const { t } = useTranslation();

  const isCodeInputReady = useMemo(
    () => codeInput.length === defaultLength && codeInput.every(Boolean),
    [codeInput]
  );

  const useVerificationCode = getCodeVerificationHookByFlow(flow);

  const errorCallback = useCallback(() => {
    setCodeInput([]);
    setInputErrorMessage(undefined);
  }, []);

  const {
    errorMessage: submitErrorMessage,
    clearErrorMessage,
    onSubmit,
  } = useVerificationCode(identifier, verificationId, errorCallback);

  const errorMessage = inputErrorMessage ?? submitErrorMessage;

  const { seconds, isRunning, onResendVerificationCode } = useResendVerificationCode(
    flow,
    identifier
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (code: string[]) => {
      setInputErrorMessage(undefined);

      setIsSubmitting(true);

      await onSubmit(code.join(''));

      setIsSubmitting(false);
    },
    [onSubmit]
  );

  useEffect(() => {
    if (isCodeInputReady) {
      void handleSubmit(codeInput);
    }
  }, [codeInput, handleSubmit, isCodeInputReady]);

  return (
    <form className={classNames(styles.form, className)}>
      <VerificationCodeInput
        name="passcode"
        className={classNames(styles.inputField, errorMessage && styles.withError)}
        value={codeInput}
        error={errorMessage}
        onChange={setCodeInput}
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
                    clearErrorMessage();
                    await onResendVerificationCode();
                    setCodeInput([]);
                  }}
                />
              ),
            }}
          >
            {t('description.resend_passcode')}
          </Trans>
        )}
      </div>
      {flow === UserFlow.SignIn && hasPasswordButton && (
        <PasswordSignInLink className={styles.switch} />
      )}
      <Button
        title="action.continue"
        type="primary"
        isLoading={isSubmitting}
        className={styles.continueButton}
        onClick={() => {
          if (!isCodeInputReady) {
            setInputErrorMessage(t('error.invalid_passcode'));
            return;
          }

          void handleSubmit(codeInput);
        }}
      />
    </form>
  );
};

export default VerificationCode;
