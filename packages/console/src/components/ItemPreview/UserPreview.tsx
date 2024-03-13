import { type User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { getUserTitle, getUserSubtitle } from '@/utils/user';

import UserAvatar from '../UserAvatar';

import ItemPreview from '.';

type Props = {
  user: Pick<User, 'id' | 'avatar' | 'name' | 'primaryEmail' | 'primaryPhone' | 'username'> &
    Partial<Pick<User, 'isSuspended'>>;
  /**
   * Whether to show the user's avatar. Explicitly set to `false` to hide it.
   */
  showAvatar?: false;
  /**
   * Whether to provide a link to user details page. Explicitly set to `false` to hide it.
   */
  hasUserDetailsLink?: false;
};

/** A component that renders a preview of a user. It's useful for displaying a user in a list. */
function UserPreview({ user, showAvatar, hasUserDetailsLink }: Props) {
  return (
    <ItemPreview
      title={getUserTitle(user)}
      subtitle={getUserSubtitle(user)}
      icon={conditional(showAvatar !== false && <UserAvatar size="large" user={user} />)}
      to={conditional(hasUserDetailsLink !== false && `/users/${user.id}`)}
      suffix={conditional(user.isSuspended && <SuspendedTag />)}
    />
  );
}

export default UserPreview;
