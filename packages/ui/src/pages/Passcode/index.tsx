import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import PasscodeValidation from '@/containers/PasscodeValidation';

import * as styles from './index.module.scss';

type Props = {
  type: string;
  channel: string;
};

const Passcode = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { type, channel } = useParams<Props>();

  // TODO: 404 page
  if (type !== 'sign-in' && type !== 'register') {
    window.location.assign('/404');

    return null;
  }

  if (channel !== 'email' && channel !== 'phone') {
    window.location.assign('/404');

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
      <PasscodeValidation type={type} channel={channel} />
    </div>
  );
};

export default Passcode;
