import { type RoleResponse, RoleType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';

import * as styles from './index.module.scss';

type Props = {
  readonly role: RoleResponse;
  readonly onDelete: () => void;
};

function TargetRoleItem({ role, onDelete }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { name, type, usersCount, applicationsCount } = role;

  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.count}>
          (
          {type === RoleType.User
            ? t('user_details.roles.assigned_user_count', { value: usersCount })
            : t('application_details.roles.assigned_app_count', { value: applicationsCount })}
          )
        </div>
      </div>
      <IconButton size="small" onClick={onDelete}>
        <Close />
      </IconButton>
    </div>
  );
}

export default TargetRoleItem;
