import { Nullable } from '@silverhand/essentials';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import PasscodeValidation from '@/containers/PasscodeValidation';
import { PageContext } from '@/hooks/use-page-context';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Parameters = {
  type: UserFlow;
  method: string;
};

type StateType = Nullable<Record<string, string>>;

const Passcode = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { method, type } = useParams<Parameters>();
  const state = useLocation().state as StateType;
  const invalidType = type !== 'sign-in' && type !== 'register';
  const invalidMethod = method !== 'email' && method !== 'sms';
  const { setToast } = useContext(PageContext);

  useEffect(() => {
    if (method && !state?.[method]) {
      setToast(t(method === 'email' ? 'error.invalid_email' : 'error.invalid_phone'));
    }
  }, [method, setToast, state, t]);

  if (invalidType || invalidMethod) {
    return <ErrorPage />;
  }

  const target = state?.[method];

  if (!target) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.title}>{t('action.enter_passcode')}</div>
        <div className={styles.detail}>{t('description.enter_passcode', { address: target })}</div>
        <PasscodeValidation type={type} method={method} target={target} />
      </div>
    </div>
  );
};

export default Passcode;
