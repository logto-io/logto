import { GoogleConnector } from '@logto/connector-kit';
import { ExtraParamsKey } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import { LoadingIconWithContainer } from '@/components/LoadingLayer';
import useSocial from '@/containers/SocialSignInList/use-social';
import useFallbackRoute from '@/hooks/use-fallback-route';
import { useSieMethods } from '@/hooks/use-sie';
import useSingleSignOn from '@/hooks/use-single-sign-on';

import styles from './index.module.scss';

const DirectSignIn = () => {
  const { method, target } = useParams();
  const [searchParams] = useSearchParams();
  const { socialConnectors, ssoConnectors } = useSieMethods();
  const { invokeSocialSignIn } = useSocial();
  const invokeSso = useSingleSignOn();
  const fallback = useFallbackRoute();
  const { experienceSettings } = useContext(PageContext);

  const googleOneTapCredential = searchParams.get(ExtraParamsKey.GoogleOneTapCredential);

  useEffect(() => {
    if (method === 'social') {
      const social = socialConnectors.find((connector) => connector.target === target);

      if (social && social.target === GoogleConnector.target && googleOneTapCredential) {
        const searchParams = new URLSearchParams();
        searchParams.set(ExtraParamsKey.GoogleOneTapCredential, googleOneTapCredential);
        // eslint-disable-next-line @silverhand/fp/no-mutation
        window.location.href = `${window.location.origin}/callback/${experienceSettings?.googleOneTap?.connectorId}?${searchParams.toString()}`;
        return;
      }

      if (social) {
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
    googleOneTapCredential,
    experienceSettings?.googleOneTap?.connectorId,
  ]);

  return (
    <div className={styles.container}>
      <LoadingIconWithContainer />
    </div>
  );
};
export default DirectSignIn;
