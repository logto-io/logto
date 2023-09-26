import { type RoleResponse, RoleType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/ds-components/Checkbox';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = {
  role: RoleResponse;
  type: RoleType;
  isSelected: boolean;
  onSelect: () => void;
};

function SourceRoleItem({ role, type, isSelected, onSelect }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { name, usersCount, applicationsCount } = role;

  return (
    <div
      className={styles.item}
      role="button"
      tabIndex={0}
      onKeyDown={onKeyDownHandler(() => {
        onSelect();
      })}
      onClick={() => {
        onSelect();
      }}
    >
      <Checkbox
        checked={isSelected}
        onChange={() => {
          onSelect();
        }}
      />
      <div className={styles.name}>{name}</div>
      <div className={styles.count}>
        (
        {t(
          type === RoleType.User
            ? 'user_details.roles.assigned_user_count'
            : 'application_details.roles.assigned_app_count',
          { value: type === RoleType.User ? usersCount : applicationsCount }
        )}
        )
      </div>
    </div>
  );
}

export default SourceRoleItem;
