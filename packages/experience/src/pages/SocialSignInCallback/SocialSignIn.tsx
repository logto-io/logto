import useSocialSignInListener from '@/hooks/use-social-sign-in-listener';

import SignIn from '../SignIn';

/**
 * Social sign in callback page
 */
type Props = {
  connectorId: string;
};

const SocialSignIn = ({ connectorId }: Props) => {
  useSocialSignInListener(connectorId);

  return <SignIn />;
};

export default SocialSignIn;
