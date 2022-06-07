import React from 'react';
import { useParams } from 'react-router-dom';

import SocialLandingContainer from '@/containers/SocialLanding';
import useSocialLandingHandler from '@/hooks/use-social-landing-handler';

import * as styles from './index.module.scss';

type Parameters = {
  connector: string;
};

const SocialLanding = () => {
  const { connector: connectorId } = useParams<Parameters>();
  const { loading } = useSocialLandingHandler(connectorId);

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
