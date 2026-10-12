import { AuthenticationContextMode, experience } from '@logto/schemas';
import { Navigate, useParams } from 'react-router-dom';

import useConnectors from '@/hooks/use-connectors';
import useStepUpContext from '@/hooks/use-step-up-context';

import SingleSignOn from './SingleSignOn';
import SocialSignIn from './SocialSignIn';

/** The real callback page for social sign-in in web browsers. */
const SocialSignInWebCallback = () => {
  const parameters = useParams<{ connectorId: string }>();
  const { findConnectorById } = useConnectors();
  const { authenticationContext } = useStepUpContext();
  const result = findConnectorById(parameters.connectorId);

  if (result?.type === 'social') {
    return <SocialSignIn connectorId={result.connector.id} />;
  }

  if (result?.type === 'sso') {
    return <SingleSignOn connectorId={result.connector.id} />;
  }

  // Connector not found, return sign in page
  return (
    <Navigate
      to={
        authenticationContext?.mode === AuthenticationContextMode.StepUp
          ? '/unknown-session'
          : '/' + experience.routes.signIn
      }
    />
  );
};

export default SocialSignInWebCallback;
