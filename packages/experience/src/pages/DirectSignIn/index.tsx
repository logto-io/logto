import { experience } from '@logto/schemas';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import LoadingLayer from '@/components/LoadingLayer';
import useSocial from '@/containers/SocialSignInList/use-social';

const DirectSignIn = () => {
  const { method, target } = useParams();
  const { socialConnectors, invokeSocialSignIn } = useSocial();
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

    window.location.replace('/' + fallback);
  }, [fallback, invokeSocialSignIn, method, socialConnectors, target]);

  return <LoadingLayer />;
};
export default DirectSignIn;
