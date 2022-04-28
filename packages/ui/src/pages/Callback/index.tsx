import React, { useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Button from '@/components/Button';
import { PageContext } from '@/hooks/use-page-context';
import useSocial from '@/hooks/use-social';

import * as styles from './index.module.scss';

type Props = {
  connector?: string;
};

const Callback = () => {
  const { connector: connectorId } = useParams<Props>();
  const { socialCallbackHandler } = useSocial();
  const { experienceSettings } = useContext(PageContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const connectorLabel = useMemo(() => {
    const connector = experienceSettings?.socialConnectors.find(({ id }) => id === connectorId);

    if (connector) {
      return (
        <div className={styles.connector}>
          <img src={connector.logo} />
        </div>
      );
    }

    return <div className={styles.connector}>{connectorId}</div>;
  }, [connectorId, experienceSettings?.socialConnectors]);

  // SocialSignIn Callback Handler
  useEffect(() => {
    socialCallbackHandler();
  }, [socialCallbackHandler]);

  return (
    <div className={styles.wrapper}>
      {connectorLabel}
      <div className={styles.loadingLabel}>loading...</div>
      <Button className={styles.button} onClick={socialCallbackHandler}>
        {t('action.continue')}
      </Button>
    </div>
  );
};

export default Callback;
