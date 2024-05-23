import { RoleType, type RoleResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  readonly role: RoleResponse;
};

function RoleInformation({ role }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { name, type, usersCount, applicationsCount } = role;

  return (
    <div className={styles.container}>
      <div className={styles.name}>{name}</div>
      <div className={styles.count}>
        (
        {type === RoleType.User
          ? t('user_details.roles.assigned_user_count', { value: usersCount })
          : t('application_details.roles.assigned_app_count', { value: applicationsCount })}
        )
      </div>
    </div>
  );
}

export default RoleInformation;
