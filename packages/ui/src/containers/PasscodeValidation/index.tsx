import type { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import Passcode, { defaultLength } from '@/components/Passcode';
import TextLink from '@/components/TextLink';
import { UserFlow } from '@/types';

import PasswordSignInLink from './PasswordSignInLink';
import * as styles from './index.module.scss';
import useResendPasscode from './use-resend-passcode';
import { getPasscodeValidationHook } from './utils';

type Props = {
  type: UserFlow;
  method: SignInIdentifier.Email | SignInIdentifier.Sms;
  target: string;
  hasPasswordButton?: boolean;
  className?: string;
};

const PasscodeValidation = ({ type, method, className, hasPasswordButton, target }: Props) => {
  const [code, setCode] = useState<string[]>([]);
  const { t } = useTranslation();
  const usePasscodeValidation = getPasscodeValidationHook(type, method);

  const errorCallback = useCallback(() => {
    setCode([]);
  }, []);

  const { errorMessage, clearErrorMessage, onSubmit } = usePasscodeValidation(
    target,
    errorCallback
  );

  const { seconds, isRunning, onResendPasscode } = useResendPasscode(type, method, target);

  useEffect(() => {
    if (code.length === defaultLength && code.every(Boolean)) {
      void onSubmit(code.join(''));
    }
  }, [code, onSubmit, target]);

  return (
    <form className={classNames(styles.form, className)}>
      <Passcode
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
          text="description.resend_passcode"
          onClick={() => {
            clearErrorMessage();
            void onResendPasscode();
          }}
        />
      )}
      {type === UserFlow.signIn && hasPasswordButton && (
        <PasswordSignInLink method={method} target={target} className={styles.link} />
      )}
    </form>
  );
};

export default PasscodeValidation;
