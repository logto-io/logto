import FormCard from '@/components/FormCard';

import UserSocialIdentities from './UserSocialIdentities';
import UserSsoIdentities from './UserSsoIdentities';

type Props = {
  readonly userId: string;
};

function UserConnections({ userId }: Props) {
  return (
    <FormCard
      title="user_details.connections.title"
      description="user_details.connections.description"
    >
      <UserSocialIdentities userId={userId} />
      <UserSsoIdentities userId={userId} />
    </FormCard>
  );
}

export default UserConnections;
