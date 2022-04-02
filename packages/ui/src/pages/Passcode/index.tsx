import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams, useLocation } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import PasscodeValidation from '@/containers/PasscodeValidation';

import * as styles from './index.module.scss';

type Props = {
  type: string;
  channel: string;
};

type StateType = {
  email?: string;
  phone?: string;
};

const Passcode = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { type, channel } = useParams<Props>();
  const location = useLocation<StateType>();

  // TODO: 404 page
  if (type !== 'sign-in' && type !== 'register') {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    history.push('/404');

    return null;
  }

  if (channel !== 'email' && channel !== 'phone') {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    history.push('/404');

    return null;
  }

  const target = location.state[channel];

  if (!target) {
    // TODO: no email or phone found
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.navBar}>
        <NavArrowIcon
          onClick={() => {
            history.goBack();
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
