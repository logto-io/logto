import React from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import SocialCreateAccount from '@/containers/SocialCreateAccount';

import * as styles from './index.module.scss';

type Parameters = {
  connector: string;
};

const SocialRegister = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { connector } = useParams<Parameters>();

  if (!connector) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar title={isMobile ? t('description.bind_account_title') : undefined} />
      <div className={styles.container}>
        {!isMobile && <div className={styles.title}>{t('description.bind_account_title')}</div>}
        <SocialCreateAccount connectorId={connector} />
      </div>
    </div>
  );
};

export default SocialRegister;
