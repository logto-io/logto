import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import SocialLanding from '@/containers/SocialLanding';
import useSocialCallbackHandler from '@/hooks/use-social-callback-handler';

import * as styles from './index.module.scss';

type Parameters = {
  connector: string;
};

const Callback = () => {
  const { connector: connectorId } = useParams<Parameters>();

  const { socialCallbackHandler } = useSocialCallbackHandler();

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
      <SocialLanding isLoading className={styles.connectorContainer} connectorId={connectorId} />
    </div>
  );
};

export default Callback;
