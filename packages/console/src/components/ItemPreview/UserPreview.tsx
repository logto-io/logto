import { type User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { getUserTitle, getUserSubtitle } from '@/utils/user';

import UserAvatar from '../UserAvatar';

import ItemPreview from '.';

type Props = {
  user: Pick<User, 'id' | 'avatar' | 'name' | 'primaryEmail' | 'primaryPhone' | 'username'> &
    Partial<Pick<User, 'isSuspended'>>;
};

/** A component that renders a preview of a user. It's useful for displaying a user in a list. */
function UserPreview({ user }: Props) {
  return (
    <ItemPreview
      title={getUserTitle(user)}
      subtitle={getUserSubtitle(user)}
      icon={<UserAvatar size="large" user={user} />}
      to={`/users/${user.id}`}
      suffix={conditional(user.isSuspended && <SuspendedTag />)}
    />
  );
}

export default UserPreview;
