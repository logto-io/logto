import { type RoleResponse } from '@logto/schemas';

import Checkbox from '@/ds-components/Checkbox';
import { onKeyDownHandler } from '@/utils/a11y';

import RoleInformation from '../../components/RoleInformation';

import styles from './index.module.scss';

type Props = {
  readonly role: RoleResponse;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
};

function SourceRoleItem({ role, isSelected, onSelect }: Props) {
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
      <RoleInformation role={role} />
    </div>
  );
}

export default SourceRoleItem;
