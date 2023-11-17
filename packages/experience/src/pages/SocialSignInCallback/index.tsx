import { useParams } from 'react-router-dom';

import useConnectors from '@/hooks/use-connectors';

import SignIn from '../SignIn';

import SingleSignOn from './SingleSignOn';
import SocialSignIn from './SocialSignIn';

const SocialSignInCallback = () => {
  const parameters = useParams<{ connectorId: string }>();
  const { findConnectorById } = useConnectors();
  const result = findConnectorById(parameters.connectorId);

  if (result?.type === 'social') {
    return <SocialSignIn connectorId={result.connector.id} />;
  }

  if (result?.type === 'sso') {
    return <SingleSignOn connectorId={result.connector.id} />;
  }

  // Connector not found, return sign in page
  return <SignIn />;
};

export default SocialSignInCallback;
