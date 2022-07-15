import useSocialSignInListener from '@/hooks/use-social-sign-in-listener';

import SignIn from '../SignIn';

const SocialSignInCallback = () => {
  useSocialSignInListener();

  return <SignIn />;
};

export default SocialSignInCallback;
