import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import SocialLandingContainer from '@/containers/SocialLanding';
import useSocialLandingHandler from '@/hooks/use-social-landing-handler';

import * as styles from './index.module.scss';

type Parameters = {
  connectorId: string;
};

const SocialLanding = () => {
  const { connectorId } = useParams<Parameters>();
  const { loading, socialLandingHandler } = useSocialLandingHandler();

  // SocialSignIn Callback Handler
  useEffect(() => {
    if (!connectorId) {
      return;
    }
    socialLandingHandler(connectorId);
  }, [connectorId, socialLandingHandler]);

  if (!connectorId) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <SocialLandingContainer
        className={styles.connectorContainer}
        connectorId={connectorId}
        isLoading={loading}
      />
    </div>
  );
};

export default SocialLanding;
