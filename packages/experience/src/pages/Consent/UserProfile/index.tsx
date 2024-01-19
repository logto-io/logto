import { type ConsentInfoResponse } from '@logto/schemas';
import classNames from 'classnames';

import * as styles from './index.module.scss';

type Props = {
  user: ConsentInfoResponse['user'];
  className?: string;
};

const UserProfile = ({
  user: { id, avatar, name, primaryEmail, primaryPhone, username },
  className,
}: Props) => {
  return (
    <div className={classNames(styles.wrapper, className)}>
      {avatar && <img src={avatar} alt="avatar" className={styles.avatar} />}
      <div>
        <div className={styles.name}>{name ?? id}</div>
        <div className={styles.identifier}>{primaryEmail ?? primaryPhone ?? username}</div>
      </div>
    </div>
  );
};

export default UserProfile;
