import { useParams } from 'react-router-dom';

import useSocialSignInListener from '@/hooks/use-social-sign-in-listener';

import SignIn from '../SignIn';

const SocialSignInCallback = () => {
  const parameters = useParams<{ connectorId: string }>();

  useSocialSignInListener(parameters.connectorId);

  return <SignIn />;
};

export default SocialSignInCallback;
