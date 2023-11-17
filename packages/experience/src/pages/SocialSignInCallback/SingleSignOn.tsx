import SignIn from '../SignIn';

import useSingleSignOnListener from './use-single-sign-on-listener';

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
