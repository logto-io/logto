import { useCallback, useState } from 'react';

import VerificationCodeInput from '@/components/VerificationCode';
import { type UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';
import useTotpCodeVerification from './use-totp-code-verification';

const totpCodeLength = 6;

type Props = {
  readonly flow: UserMfaFlow;
};

const TotpCodeVerification = ({ flow }: Props) => {
  const [code, setCode] = useState<string[]>([]);
  const errorCallback = useCallback(() => {
    setCode([]);
  }, []);

  const { errorMessage, onSubmit } = useTotpCodeVerification(flow, errorCallback);

  return (
    <VerificationCodeInput
      name="totpCode"
      value={code}
      className={styles.totpCodeInput}
      error={errorMessage}
      onChange={(code) => {
        setCode(code);

        if (code.length === totpCodeLength && code.every(Boolean)) {
          onSubmit(code.join(''));
        }
      }}
    />
  );
};

export default TotpCodeVerification;
