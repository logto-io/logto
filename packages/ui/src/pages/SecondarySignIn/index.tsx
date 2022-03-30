// TODO: uncomment the changes after #457 PR is merged

import React from 'react';
import { useTranslation } from 'react-i18next';
// Import { useHistory } from 'react-router-dom';

// import NavArrowIcon from '@/components/Icons/NavArrowIcon';
import { PhonePasswordless } from '@/containers/Passwordless';

import * as styles from './index.module.scss';

const SecondarySignIn = () => {
  const { t } = useTranslation();
  // Const history = useHistory();

  return (
    <div className={styles.wrapper}>
      <div className={styles.navBar}>
        {/* <NavArrowIcon
          onClick={() => {
            history.goBack();
          }}
        /> */}
      </div>
      <div className={styles.title}>{t('sign_in.sign_in')}</div>
      <PhonePasswordless type="sign-in" />
    </div>
  );
};

export default SecondarySignIn;
