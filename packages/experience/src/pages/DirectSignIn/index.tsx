import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { LoadingIconWithContainer } from '@/components/LoadingLayer';
import useSocial from '@/containers/SocialSignInList/use-social';
import useFallbackRoute from '@/hooks/use-fallback-route';
import { useSieMethods } from '@/hooks/use-sie';
import useSingleSignOn from '@/hooks/use-single-sign-on';

import styles from './index.module.scss';

const DirectSignIn = () => {
  const { method, target } = useParams();
  const { socialConnectors, ssoConnectors } = useSieMethods();
  const { invokeSocialSignIn } = useSocial();
  const invokeSso = useSingleSignOn();
  const fallback = useFallbackRoute();

  useEffect(() => {
    if (method === 'social') {
      const social = socialConnectors.find((connector) => connector.target === target);
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
  }, [fallback, invokeSocialSignIn, invokeSso, method, socialConnectors, ssoConnectors, target]);

  return (
    <div className={styles.container}>
      <LoadingIconWithContainer />
    </div>
  );
};
export default DirectSignIn;
