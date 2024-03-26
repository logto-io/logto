import LoadingLayer from '@/components/LoadingLayer';

import useSocialSignInListener from './use-social-sign-in-listener';

/**
 * Social sign in callback page
 */
type Props = {
  connectorId: string;
};

const SocialSignIn = ({ connectorId }: Props) => {
  useSocialSignInListener(connectorId);

  return <LoadingLayer />;
};

export default SocialSignIn;
