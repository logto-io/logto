import { useParams } from 'react-router-dom';

import useSocialSignInListener from '@/hooks/use-social-sign-in-listener';

import SignIn from '../SignIn';

const SocialSignInCallback = () => {
  const parameters = useParams<{ connector: string }>();

  useSocialSignInListener(parameters.connector);

  return <SignIn />;
};

export default SocialSignInCallback;
