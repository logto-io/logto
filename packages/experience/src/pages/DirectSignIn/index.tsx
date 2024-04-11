import { experience } from '@logto/schemas';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import LoadingLayer from '@/components/LoadingLayer';
import useSocial from '@/containers/SocialSignInList/use-social';
import { useSieMethods } from '@/hooks/use-sie';
import useSingleSignOn from '@/hooks/use-single-sign-on';

const DirectSignIn = () => {
  const { method, target } = useParams();
  const { socialConnectors, ssoConnectors } = useSieMethods();
  const { invokeSocialSignIn } = useSocial();
  const invokeSso = useSingleSignOn();
  const fallback = useMemo(() => {
    const fallbackKey = new URLSearchParams(window.location.search).get('fallback');
    return (
      Object.entries(experience.routes).find(([key]) => key === fallbackKey)?.[1] ??
      experience.routes.signIn
    );
  }, []);

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

  return <LoadingLayer />;
};
export default DirectSignIn;
