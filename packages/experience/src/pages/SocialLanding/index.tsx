import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import SocialLandingContainer from '@/containers/SocialLanding';

import * as styles from './index.module.scss';
import useSocialLandingHandler from './use-social-landing-handler';

type Parameters = {
  connectorId: string;
};

/**
 * SocialLanding page
 * Used for both SocialSignIn and SingleSignOn
 * Only used for native app out of the app webview sign-in flow
 * Store the native callback url in the session storage before redirect to the IdP
 */
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
    <StaticPageLayout>
      <SocialLandingContainer
        className={styles.connectorContainer}
        connectorId={connectorId}
        isLoading={loading}
      />
    </StaticPageLayout>
  );
};

export default SocialLanding;
