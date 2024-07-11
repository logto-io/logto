import { useCallback, useState } from 'react';

import Button from '@/components/Button';
import VerificationCodeInput from '@/components/VerificationCode';
import { type UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';
import useTotpCodeVerification from './use-totp-code-verification';

const totpCodeLength = 6;

const isCodeReady = (code: string[]) => {
  return code.length === totpCodeLength && code.every(Boolean);
};

type Props = {
  readonly flow: UserMfaFlow;
};

const TotpCodeVerification = ({ flow }: Props) => {
  const [codeInput, setCodeInput] = useState<string[]>([]);
  const errorCallback = useCallback(() => {
    setCodeInput([]);
  }, []);

  const { errorMessage, onSubmit } = useTotpCodeVerification(flow, errorCallback);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (code: string[]) => {
      setIsSubmitting(true);
      await onSubmit(code.join(''));
      setIsSubmitting(false);
    },
    [onSubmit]
  );

  return (
    <>
      <VerificationCodeInput
        name="totpCode"
        value={codeInput}
        className={styles.totpCodeInput}
        error={errorMessage}
        onChange={async (code) => {
          setCodeInput(code);
          if (isCodeReady(code)) {
            await handleSubmit(code);
          }
        }}
      />
      <Button
        title="action.continue"
        type="primary"
        className={styles.continueButton}
        isLoading={isSubmitting}
        isDisabled={!isCodeReady(codeInput)}
        onClick={async () => {
          await handleSubmit(codeInput);
        }}
      />
    </>
  );
};

export default TotpCodeVerification;
