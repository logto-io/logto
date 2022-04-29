import { Nullable } from '@silverhand/essentials';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import PasscodeValidation from '@/containers/PasscodeValidation';
import { UserFlow } from '@/types';

import NotFound from '../NotFound';
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
  const { method, type } = useParams<Parameters>();
  const state = useLocation().state as StateType;
  const invalidType = type !== 'sign-in' && type !== 'register';
  const invalidMethod = method !== 'email' && method !== 'sms';

  if (invalidType || invalidMethod) {
    return <NotFound />;
  }

  const target = state?.[method];

  if (!target) {
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
