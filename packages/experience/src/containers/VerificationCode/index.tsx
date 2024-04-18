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
  readonly flow: UserFlow;
  readonly identifier: SignInIdentifier.Email | SignInIdentifier.Phone;
  readonly target: string;
  readonly hasPasswordButton?: boolean;
  readonly className?: string;
};

const VerificationCode = ({ flow, identifier, className, hasPasswordButton, target }: Props) => {
  const [code, setCode] = useState<string[]>([]);
  const { t } = useTranslation();

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

  useEffect(() => {
    if (code.length === defaultLength && code.every(Boolean)) {
      const payload =
        identifier === SignInIdentifier.Email
          ? { email: target, verificationCode: code.join('') }
          : { phone: target, verificationCode: code.join('') };
      void onSubmit(payload);
    }
  }, [code, identifier, onSubmit, target]);

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
          onClick={async () => {
            clearErrorMessage();
            await onResendVerificationCode();
            setCode([]);
          }}
        />
      )}

      {flow === UserFlow.SignIn && hasPasswordButton && (
        <PasswordSignInLink method={identifier} target={target} className={styles.switch} />
      )}
    </form>
  );
};

export default VerificationCode;
