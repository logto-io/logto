import type { User } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/images/close.svg';

import IconButton from '../IconButton';
import UserAvatar from '../UserAvatar';
import * as styles from './index.module.scss';

type Props = {
  selectedUsers: User[];
  onRemoveUser: (user: User) => void;
};

const TargetUsersBox = ({ selectedUsers, onRemoveUser }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.box}>
      <div className={classNames(styles.top, styles.added)}>
        <span>
          {`${selectedUsers.length} `}
          {t('general.added')}
        </span>
      </div>
      <div className={styles.content}>
        {selectedUsers.map((user) => {
          const { id, avatar, name } = user;

          return (
            <div key={id} className={styles.item}>
              <UserAvatar className={styles.avatar} url={avatar} />
              <div className={styles.name}>{name ?? t('users.unnamed')}</div>
              <IconButton
                size="small"
                iconClassName={styles.icon}
                onClick={() => {
                  onRemoveUser(user);
                }}
              >
                <Close />
              </IconButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TargetUsersBox;
