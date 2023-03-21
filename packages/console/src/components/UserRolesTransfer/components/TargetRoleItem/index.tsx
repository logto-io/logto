import type { RoleResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/images/close.svg';
import IconButton from '@/components/IconButton';

import * as styles from './index.module.scss';

type Props = {
  role: RoleResponse;
  onDelete: () => void;
};

function TargetRoleItem({ role, onDelete }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { name, usersCount } = role;

  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.count}>
          ({t('user_details.roles.assigned_user_count', { value: usersCount })})
        </div>
      </div>
      <IconButton size="small" iconClassName={styles.icon} onClick={onDelete}>
        <Close />
      </IconButton>
    </div>
  );
}

export default TargetRoleItem;
