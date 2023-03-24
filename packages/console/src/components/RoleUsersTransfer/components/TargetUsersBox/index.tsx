import type { User } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import * as transferLayout from '@/scss/transfer.module.scss';

import * as styles from './index.module.scss';
import TargetUserItem from '../TargetUserItem';

type Props = {
  selectedUsers: User[];
  onChange: (value: User[]) => void;
};

function TargetUsersBox({ selectedUsers, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <span className={styles.added}>
          {`${selectedUsers.length} `}
          {t('general.added')}
        </span>
      </div>
      <div className={transferLayout.boxContent}>
        {selectedUsers.map((user) => (
          <TargetUserItem
            key={user.id}
            user={user}
            onDelete={() => {
              onChange(selectedUsers.filter(({ id }) => id !== user.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default TargetUsersBox;
