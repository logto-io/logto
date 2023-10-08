import { useState } from 'react';

import VerificationCodeInput from '@/components/VerificationCode';
import { type UserMfaFlow } from '@/types';

import * as styles from './index.module.scss';
import useTotpCodeVerification from './use-totp-code-verification';

const totpCodeLength = 6;

type Options = {
  flow: UserMfaFlow;
};

const TotpCodeVerification = ({ flow }: Options) => {
  const [code, setCode] = useState<string[]>([]);
  const { errorMessage, onSubmit } = useTotpCodeVerification({ flow });

  return (
    <VerificationCodeInput
      name="totpCode"
      value={code}
      className={styles.totpCodeInput}
      error={errorMessage}
      onChange={(code) => {
        setCode(code);

        if (code.length === totpCodeLength && code.every(Boolean)) {
          void onSubmit(code.join(''));
        }
      }}
    />
  );
};

export default TotpCodeVerification;
