import { type UserInfo } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { getUserTitle, getUserSubtitle } from '@/utils/user';

import UserAvatar from '../UserAvatar';

import ItemPreview from '.';

type Props = {
  /**
   * A subset of User schema type that is used in the preview component.
   */
  readonly user: {
    id: UserInfo['id'];
    avatar?: UserInfo['avatar'];
    name?: UserInfo['name'];
    primaryEmail?: UserInfo['primaryEmail'];
    primaryPhone?: UserInfo['primaryPhone'];
    username?: UserInfo['username'];
    isSuspended?: UserInfo['isSuspended'];
  };
  /**
   * Whether to provide a link to user details page. Explicitly set to `false` to hide it.
   */
  readonly hasUserDetailsLink?: false;
};

/** A component that renders a preview of a user. It's useful for displaying a user in a list. */
function UserPreview({ user, hasUserDetailsLink }: Props) {
  return (
    <ItemPreview
      title={getUserTitle(user)}
      subtitle={getUserSubtitle(user)}
      icon={<UserAvatar size="large" user={user} />}
      to={conditional(hasUserDetailsLink !== false && `/users/${user.id}`)}
      suffix={conditional(user.isSuspended && <SuspendedTag />)}
    />
  );
}

export default UserPreview;
