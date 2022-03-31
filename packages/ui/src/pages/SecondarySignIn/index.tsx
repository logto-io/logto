import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import { PhonePasswordless } from '@/containers/Passwordless';

import * as styles from './index.module.scss';

const SecondarySignIn = () => {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <div className={styles.wrapper}>
      <div className={styles.navBar}>
        <NavArrowIcon
          onClick={() => {
            history.goBack();
          }}
        />
      </div>
      <div className={styles.title}>{t('sign_in.sign_in')}</div>
      <PhonePasswordless type="sign-in" />
    </div>
  );
};

export default SecondarySignIn;
