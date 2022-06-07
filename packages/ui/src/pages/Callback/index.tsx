import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Button from '@/components/Button';
import SocialLanding from '@/containers/SocialLanding';
import useSocialCallbackHandler from '@/hooks/use-social-callback-handler';

import * as styles from './index.module.scss';

type Props = {
  connector: string;
};

const Callback = () => {
  const { connector: connectorId } = useParams<Props>();
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  const { socialCallbackHandler, loading } = useSocialCallbackHandler();

  // SocialSignIn Callback Handler
  useEffect(() => {
    if (!connectorId) {
      return;
    }
    socialCallbackHandler(connectorId);
  }, [socialCallbackHandler, connectorId]);

  if (!connectorId) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <SocialLanding
        className={styles.connectorContainer}
        connectorId={connectorId}
        isLoading={loading}
      />
      <Button
        className={styles.button}
        onClick={() => {
          socialCallbackHandler(connectorId);
        }}
      >
        {t('action.continue')}
      </Button>
    </div>
  );
};

export default Callback;
