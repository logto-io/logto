import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

import NavBar from '@/components/NavBar';
import SocialCreateAccount from '@/containers/SocialCreateAccount';

import * as styles from './index.module.scss';

type Parameters = {
  connector: string;
};

const SocialRegister = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { connector } = useParams<Parameters>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connector) {
      navigate('/404');
    }
  }, [connector, navigate]);

  if (!connector) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <NavBar title={t('description.bind_account_title')} />
      <SocialCreateAccount connectorId={connector} />
    </div>
  );
};

export default SocialRegister;
