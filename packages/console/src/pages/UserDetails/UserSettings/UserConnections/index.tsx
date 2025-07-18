import { type GetUserAllIdentitiesResponse } from '@logto/schemas';
import useSWR from 'swr';

import FormCard from '@/components/FormCard';
import { type RequestError } from '@/hooks/use-api';

import UserSocialIdentities from './UserSocialIdentities';
import UserSsoIdentities from './UserSsoIdentities';

type Props = {
  readonly userId: string;
};

function UserConnections({ userId }: Props) {
  const { data, error } = useSWR<GetUserAllIdentitiesResponse, RequestError>(
    `api/users/${userId}/all-identities?includeTokenSecret=true`
  );

  const isLoading = !data && !error;
  const { socialIdentities, ssoIdentities } = data ?? {};

  return (
    <FormCard
      title="user_details.connections.title"
      description="user_details.connections.description"
    >
      <UserSocialIdentities identities={socialIdentities} isIdentitiesLoading={isLoading} />
      <UserSsoIdentities ssoIdentities={ssoIdentities} isIdentitiesLoading={isLoading} />
    </FormCard>
  );
}

export default UserConnections;
