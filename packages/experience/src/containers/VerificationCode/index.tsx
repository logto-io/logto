import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Button from '@/components/Button';
import TextLink from '@/components/TextLink';
import VerificationCodeInput, { defaultLength } from '@/components/VerificationCode';
import { UserFlow } from '@/types';

import PasswordSignInLink from './PasswordSignInLink';
import * as styles from './index.module.scss';
import useResendVerificationCode from './use-resend-verification-code';
import { getCodeVerificationHookByFlow } from './utils';

type Props = {
  readonly flow: UserFlow;
  readonly identifier: SignInIdentifier.Email | SignInIdentifier.Phone;
  readonly target: string;
  readonly hasPasswordButton?: boolean;
  readonly className?: string;
};

const VerificationCode = ({ flow, identifier, className, hasPasswordButton, target }: Props) => {
  const [code, setCode] = useState<string[]>([]);
  const { t } = useTranslation();

  const isCodeReady = code.length === defaultLength && code.every(Boolean);

  const useVerificationCode = getCodeVerificationHookByFlow(flow);

  const errorCallback = useCallback(() => {
    setCode([]);
  }, []);

  const { errorMessage, clearErrorMessage, onSubmit } = useVerificationCode(
    identifier,
    target,
    errorCallback
  );

  const { seconds, isRunning, onResendVerificationCode } = useResendVerificationCode(
    flow,
    identifier,
    target
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!isCodeReady) {
      return;
    }

    setIsSubmitting(true);

    await onSubmit(
      identifier === SignInIdentifier.Email
        ? { email: target, verificationCode: code.join('') }
        : { phone: target, verificationCode: code.join('') }
    );

    setIsSubmitting(false);
  }, [code, identifier, isCodeReady, onSubmit, target]);

  useEffect(() => {
    void handleSubmit();
  }, [handleSubmit]);

  return (
    <form className={classNames(styles.form, className)}>
      <VerificationCodeInput
        name="passcode"
        className={classNames(styles.inputField, errorMessage && styles.withError)}
        value={code}
        error={errorMessage}
        onChange={setCode}
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
                    setCode([]);
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
        isDisabled={!isCodeReady}
        isLoading={isSubmitting}
        className={styles.continueButton}
        onClick={handleSubmit}
      />
    </form>
  );
};

export default VerificationCode;
