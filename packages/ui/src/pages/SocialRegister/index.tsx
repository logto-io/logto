import React from 'react';
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
    <>
      <NavBar title={t('description.bind_account_title')} />
      <div className={styles.wrapper}>
        <SocialCreateAccount connectorId={connector} />
      </div>
    </>
  );
};

export default SocialRegister;
