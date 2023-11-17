import useSingleSignOnListener from '@/hooks/use-single-sign-on-listener';

import SignIn from '../SignIn';

/**
 * Single sign-on callback page
 */
type Props = {
  connectorId: string;
};

const SingleSignOn = ({ connectorId }: Props) => {
  useSingleSignOnListener(connectorId);
  return <SignIn />;
};

export default SingleSignOn;
