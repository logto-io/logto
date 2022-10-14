import classNames from 'classnames';
import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';

import { getSendPasscodeApi, getVerifyPasscodeApi } from '@/apis/utils';
import Passcode, { defaultLength } from '@/components/Passcode';
import TextLink from '@/components/TextLink';
import useApi, { ErrorHandlers } from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';
import { UserFlow, SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';

import * as styles from './index.module.scss';
import usePasscodeValidationErrorHandler from './use-passcode-validation-error-handler';

type Props = {
  type: UserFlow;
  method: 'email' | 'sms';
  target: string;
  className?: string;
};

export const timeRange = 59;

const getTimeout = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + timeRange);

  return now;
};

const PasscodeValidation = ({ type, method, className, target }: Props) => {
  const [code, setCode] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const { setToast } = useContext(PageContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { seconds, isRunning, restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getTimeout(),
  });

  // Get the flow specific error handler hook
  const { errorHandler } = usePasscodeValidationErrorHandler(type, method, target);

  const verifyPasscodeErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      ...errorHandler,
      'passcode.expired': (error) => {
        setError(error.message);
      },
      'passcode.code_mismatch': (error) => {
        setError(error.message);
      },
      callback: () => {
        setCode([]);
      },
    }),
    [errorHandler]
  );

  const { result: verifyPasscodeResult, run: verifyPassCode } = useApi(
    getVerifyPasscodeApi(type, method),
    verifyPasscodeErrorHandlers
  );

  const { run: sendPassCode } = useApi(getSendPasscodeApi(type, method));

  const resendPasscodeHandler = useCallback(async () => {
    setError(undefined);

    const result = await sendPassCode(target);

    if (result) {
      setToast(t('description.passcode_sent'));
      restart(getTimeout(), true);
    }
  }, [restart, sendPassCode, setToast, t, target]);

  useEffect(() => {
    if (code.length === defaultLength && code.every(Boolean)) {
      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);
      void verifyPassCode(target, code.join(''), socialToBind);
    }
  }, [code, target, verifyPassCode]);

  useEffect(() => {
    if (verifyPasscodeResult?.redirectTo) {
      window.location.replace(verifyPasscodeResult.redirectTo);

      return;
    }

    if (verifyPasscodeResult && type === 'forgot-password') {
      navigate('/forgot-password/reset', { replace: true });
    }
  }, [navigate, type, verifyPasscodeResult]);

  return (
    <form className={classNames(styles.form, className)}>
      <Passcode
        name="passcode"
        className={classNames(styles.inputField, error && styles.withError)}
        value={code}
        error={error}
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
          onClick={resendPasscodeHandler}
        />
      )}
    </form>
  );
};

export default PasscodeValidation;
