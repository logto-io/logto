import type { RoleResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import transferLayout from '@/scss/transfer.module.scss';

import TargetRoleItem from './TargetRoleItem';
import styles from './index.module.scss';

type Props = {
  readonly selectedRoles: RoleResponse[];
  readonly onChange: (value: RoleResponse[]) => void;
};

function TargetRolesBox({ selectedRoles, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <span className={styles.added}>
          {`${selectedRoles.length} `}
          {t('general.added')}
        </span>
      </div>
      <div className={transferLayout.boxContent}>
        {selectedRoles.map((role) => (
          <TargetRoleItem
            key={role.id}
            role={role}
            onDelete={() => {
              onChange(selectedRoles.filter(({ id }) => id !== role.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default TargetRolesBox;
