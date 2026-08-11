import { GoogleConnector } from '@logto/connector-kit';
import { useContext, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import useSocial from '@/containers/SocialSignInList/use-social';
import useFallbackRoute from '@/hooks/use-fallback-route';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
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
  const { set } = useSessionStorage();

  // Prevent multiple invocations due to `invokeSocialSignIn` or `invokeSso` causing re-renders
  const hasSignInInvokedRef = useRef(false);

  useEffect(() => {
    if (hasSignInInvokedRef.current) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    hasSignInInvokedRef.current = true;

    if (method === 'social') {
      const social = socialConnectors.find((connector) => connector.target === target);

      if (social) {
        // Mark the session as entered through direct sign-in, so error handlers finish the
        // interaction back at the client instead of falling back to the hosted sign-in page.
        // The value records the entry point for debugging; its presence alone drives behavior.
        set(StorageKeys.DirectSignIn, `${method}:${social.target}`);

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
        set(StorageKeys.DirectSignIn, `${method}:${sso.id}`);
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
    set,
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
