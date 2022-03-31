import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import CreateAccount from '@/containers/CreateAccount';

import * as styles from './index.module.scss';

const Register = () => {
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
      <div className={styles.title}>{t('register.create_account')}</div>
      <CreateAccount />
    </div>
  );
};

export default Register;
