import type { User } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/images/close.svg';
import IconButton from '@/components/IconButton';
import UserAvatar from '@/components/UserAvatar';

import * as styles from './index.module.scss';

type Props = {
  user: User;
  onDelete: () => void;
};

const TargetUserItem = ({ user: { avatar, name }, onDelete }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.item}>
      <UserAvatar className={styles.avatar} url={avatar} />
      <div className={styles.name}>{name ?? t('users.unnamed')}</div>
      <IconButton
        size="small"
        iconClassName={styles.icon}
        onClick={() => {
          onDelete();
        }}
      >
        <Close />
      </IconButton>
    </div>
  );
};

export default TargetUserItem;
