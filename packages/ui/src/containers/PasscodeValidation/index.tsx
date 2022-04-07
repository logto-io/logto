import classNames from 'classnames';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import reactStringReplace from 'react-string-replace';
import { useTimer } from 'react-timer-hook';

import { getSendPasscodeApi, getVerifyPasscodeApi } from '@/apis/utils';
import { ErrorType } from '@/components/ErrorMessage';
import Passcode, { defaultLength } from '@/components/Passcode';
import TextLink from '@/components/TextLink';
import PageContext from '@/hooks/page-context';
import useApi from '@/hooks/use-api';
import { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  type: UserFlow;
  channel: 'email' | 'phone';
  target: string;
  className?: string;
};

export const timeRange = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);

  return now;
};

const PasscodeValidation = ({ type, channel, className, target }: Props) => {
  const [code, setCode] = useState<string[]>([]);
  const [error, setError] = useState<ErrorType>();
  const { setToast } = useContext(PageContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  const {
    error: verifyPasscodeError,
    result: verifyPasscodeResult,
    run: verifyPassCode,
  } = useApi(getVerifyPasscodeApi(type, channel));

  const {
    error: sendPasscodeError,
    result: sendPasscodeResult,
    run: sendPassCode,
  } = useApi(getSendPasscodeApi(type, channel));

  useEffect(() => {
    if (code.length === defaultLength && code.every(Boolean)) {
      void verifyPassCode(target, code.join(''));
    }
  }, [code, target, verifyPassCode]);

  useEffect(() => {
    // Restart count down
    if (sendPasscodeResult) {
      restart(getTimeout(), true);
    }
  }, [sendPasscodeResult, restart]);

  useEffect(() => {
    if (verifyPasscodeResult?.redirectTo) {
      window.location.assign(verifyPasscodeResult.redirectTo);
    }
  }, [verifyPasscodeResult]);

  useEffect(() => {
    // TODO: move to global handling
    if (sendPasscodeError) {
      setToast(t('error.request', { ...sendPasscodeError }));
    }
  }, [sendPasscodeError, setToast, t]);

  useEffect(() => {
    // TODO: load error from api response
    if (verifyPasscodeError) {
      setError('invalid_passcode');
    }
  }, [verifyPasscodeError]);

  const renderCountDownMessage = useMemo(() => {
    const contents = t('description.resend_after_senconds', { seconds });

    return (
      <div className={styles.message}>
        {reactStringReplace(contents, `${seconds}`, (match) => (
          <span key="counter">{match}</span>
        ))}
      </div>
    );
  }, [seconds, t]);

  return (
    <form className={classNames(styles.form, className)}>
      <Passcode
        name="passcode"
        className={classNames(styles.field, error && styles.withError)}
        value={code}
        error={error}
        onChange={setCode}
      />
      {isRunning ? (
        renderCountDownMessage
      ) : (
        <TextLink
          text="description.resend_passcode"
          onClick={() => {
            void sendPassCode(target);
          }}
        />
      )}
    </form>
  );
};

export default PasscodeValidation;
