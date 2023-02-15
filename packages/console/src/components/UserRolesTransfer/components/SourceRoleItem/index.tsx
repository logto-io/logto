import type { RoleResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/components/Checkbox';
import { onKeyDownHandler } from '@/utils/a11y';

import * as styles from './index.module.scss';

type Props = {
  role: RoleResponse;
  isSelected: boolean;
  onSelect: () => void;
};

const SourceRoleItem = ({ role, isSelected, onSelect }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { name, usersCount } = role;

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
        ({t('user_details.roles.assigned_user_count', { value: usersCount })})
      </div>
    </div>
  );
};

export default SourceRoleItem;
