import { GoogleConnector } from '@logto/connector-kit';
import { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import useSocial from '@/containers/SocialSignInList/use-social';
import useFallbackRoute from '@/hooks/use-fallback-route';
import { useSieMethods } from '@/hooks/use-sie';
import useSingleSignOn from '@/hooks/use-single-sign-on';
import { LoadingIconWithContainer } from '@/shared/components/LoadingLayer';
import { logtoGoogleOneTapCookie } from '@/utils/cookies';

import styles from './index.module.scss';

const DirectSignIn = () => {
  const { method, target } = useParams();
  const { socialConnectors, ssoConnectors } = useSieMethods();
  const { invokeSocialSignIn } = useSocial();
  const invokeSso = useSingleSignOn();
  const fallback = useFallbackRoute();
  const { experienceSettings } = useContext(PageContext);

  useEffect(() => {
    if (method === 'social') {
      const social = socialConnectors.find((connector) => connector.target === target);

      if (social) {
        // Redirect to the Google One Tap callback page if the social connector is Google and the logtoGoogleOneTapCookie is present (external Google One Tap).
        if (social.target === GoogleConnector.target && logtoGoogleOneTapCookie) {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          window.location.href = `${window.location.origin}/callback/${experienceSettings?.googleOneTap?.connectorId}`;
          return;
        }

        void invokeSocialSignIn(social);
        return;
      }
    }

    if (method === 'sso') {
      const sso = ssoConnectors.find((connector) => connector.id === target);

      if (sso) {
        void invokeSso(sso.id);
        return;
      }
    }

    window.location.replace('/' + fallback);
  }, [
    fallback,
    invokeSocialSignIn,
    invokeSso,
    method,
    socialConnectors,
    ssoConnectors,
    target,
    experienceSettings?.googleOneTap?.connectorId,
  ]);

  return (
    <div className={styles.container}>
      <LoadingIconWithContainer />
    </div>
  );
};
export default DirectSignIn;
