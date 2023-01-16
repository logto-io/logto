import { useParams, useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SocialLinkAccountContainer from '@/containers/SocialLinkAccount';
import ErrorPage from '@/pages/ErrorPage';
import { socialAccountNotExistErrorDataGuard } from '@/types/guard';

type Parameters = {
  connector: string;
};

const SocialLinkAccount = () => {
  const { connector } = useParams<Parameters>();
  const { state } = useLocation();

  if (!is(state, socialAccountNotExistErrorDataGuard)) {
    return <ErrorPage rawMessage="Missing relate account info" />;
  }

  if (!connector) {
    return <ErrorPage rawMessage="Connector not found" />;
  }

  const { relatedUser } = state;

  return (
    <SecondaryPageWrapper title="description.bind_account_title">
      <SocialLinkAccountContainer connectorId={connector} relatedUser={relatedUser} />
    </SecondaryPageWrapper>
  );
};

export default SocialLinkAccount;
