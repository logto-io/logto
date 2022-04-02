import { Nullable } from '@silverhand/essentials';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import PasscodeValidation from '@/containers/PasscodeValidation';
import { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Parameters = {
  type: UserFlow;
  channel: string;
};

type StateType = Nullable<{
  email?: string;
  phone?: string;
}>;

const Passcode = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { channel, type } = useParams<Parameters>();
  const state = useLocation().state as StateType;
  const invalidSignInMethod = type !== 'sign-in' && type !== 'register';
  const invalidChannel = channel !== 'email' && channel !== 'phone';

  useEffect(() => {
    if (invalidSignInMethod || invalidChannel) {
      navigate('/404', { replace: true });
    }
  }, [invalidChannel, invalidSignInMethod, navigate]);

  if (invalidSignInMethod || invalidChannel) {
    return null;
  }

  const target = state ? state[channel] : undefined;

  if (!target) {
    // TODO: no email or phone found
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.navBar}>
        <NavArrowIcon
          onClick={() => {
            navigate(-1);
          }}
        />
      </div>
      <div className={styles.title}>{t('sign_in.enter_passcode')}</div>
      <div className={styles.detail}>{t('sign_in.passcode_sent', { target })}</div>
      <PasscodeValidation type={type} channel={channel} target={target} />
    </div>
  );
};

export default Passcode;
