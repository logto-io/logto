import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import TextLink from '@/components/TextLink';
import VerificationCodeInput, { defaultLength } from '@/components/VerificationCode';
import { UserFlow } from '@/types';

import PasswordSignInLink from './PasswordSignInLink';
import * as styles from './index.module.scss';
import useResendVerificationCode from './use-resend-verification-code';
import { getCodeVerificationHookByFlow } from './utils';

type Props = {
  type: UserFlow;
  method: SignInIdentifier.Email | SignInIdentifier.Phone;
  target: string;
  hasPasswordButton?: boolean;
  className?: string;
};

const VerificationCode = ({ type, method, className, hasPasswordButton, target }: Props) => {
  const [code, setCode] = useState<string[]>([]);
  const { t } = useTranslation();

  const useVerificationCode = getCodeVerificationHookByFlow(type);

  const errorCallback = useCallback(() => {
    setCode([]);
  }, []);

  const { errorMessage, clearErrorMessage, onSubmit } = useVerificationCode(
    method,
    target,
    errorCallback
  );

  const { seconds, isRunning, onResendVerificationCode } = useResendVerificationCode(
    type,
    method,
    target
  );

  useEffect(() => {
    if (code.length === defaultLength && code.every(Boolean)) {
      const payload =
        method === SignInIdentifier.Email
          ? { email: target, verificationCode: code.join('') }
          : { phone: target, verificationCode: code.join('') };
      void onSubmit(payload);
    }
  }, [code, method, onSubmit, target]);

  return (
    <form className={classNames(styles.form, className)}>
      <VerificationCodeInput
        name="passcode"
        className={classNames(styles.inputField, errorMessage && styles.withError)}
        value={code}
        error={errorMessage}
        onChange={setCode}
      />
      {isRunning ? (
        <div className={styles.message}>
          <Trans components={{ span: <span key="counter" /> }}>
            {t('description.resend_after_seconds', { seconds })}
          </Trans>
        </div>
      ) : (
        <TextLink
          className={styles.link}
          text="description.resend_passcode"
          onClick={() => {
            clearErrorMessage();
            void onResendVerificationCode();
          }}
        />
      )}
      {type === UserFlow.signIn && hasPasswordButton && (
        <PasswordSignInLink method={method} target={target} className={styles.switch} />
      )}
    </form>
  );
};

export default VerificationCode;
