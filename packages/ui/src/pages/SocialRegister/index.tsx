import { useParams } from 'react-router-dom';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SocialCreateAccount from '@/containers/SocialCreateAccount';

type Parameters = {
  connector: string;
};

const SocialRegister = () => {
  const { connector } = useParams<Parameters>();

  if (!connector) {
    return null;
  }

  return (
    <SecondaryPageWrapper title="description.bind_account_title">
      <SocialCreateAccount connectorId={connector} />
    </SecondaryPageWrapper>
  );
};

export default SocialRegister;
