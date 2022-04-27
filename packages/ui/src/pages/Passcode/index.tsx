import { Nullable } from '@silverhand/essentials';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import PasscodeValidation from '@/containers/PasscodeValidation';
import { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Parameters = {
  type: UserFlow;
  method: string;
};

type StateType = Nullable<{
  email?: string;
  sms?: string;
}>;

const Passcode = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const navigate = useNavigate();
  const { method, type } = useParams<Parameters>();
  const state = useLocation().state as StateType;
  const invalidSignInMethod = type !== 'sign-in' && type !== 'register';
  const invalidMethod = method !== 'email' && method !== 'sms';

  useEffect(() => {
    if (invalidSignInMethod || invalidMethod) {
      navigate('/404', { replace: true });
    }
  }, [invalidMethod, invalidSignInMethod, navigate]);

  if (invalidSignInMethod || invalidMethod) {
    return null;
  }

  const target = state ? state[method] : undefined;

  if (!target) {
    // TODO: no email or phone found
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.title}>{t('action.enter_passcode')}</div>
      <div className={styles.detail}>{t('description.enter_passcode', { address: target })}</div>
      <PasscodeValidation type={type} method={method} target={target} />
    </div>
  );
};

export default Passcode;
