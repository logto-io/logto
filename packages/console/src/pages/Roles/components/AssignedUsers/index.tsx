import type { User } from '@logto/schemas';

import UserAvatar from '@/components/UserAvatar';

import * as styles from './index.module.scss';

type Props = {
  users: Array<Pick<User, 'avatar' | 'id'>>;
  count: number;
};

const AssignedUsers = ({ users, count }: Props) =>
  count > 0 ? (
    <div className={styles.users}>
      <div className={styles.avatars}>
        {users.map(({ id, avatar }) => (
          <UserAvatar key={id} url={avatar} className={styles.avatar} />
        ))}
      </div>
      <span className={styles.count}>{count.toLocaleString()}</span>
    </div>
  ) : (
    <span className={styles.empty}>-</span>
  );

export default AssignedUsers;
