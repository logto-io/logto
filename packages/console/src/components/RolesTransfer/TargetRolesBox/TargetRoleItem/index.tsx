import { type RoleResponse } from '@logto/schemas';

import Close from '@/assets/icons/close.svg';
import IconButton from '@/ds-components/IconButton';

import RoleInformation from '../../components/RoleInformation';

import * as styles from './index.module.scss';

type Props = {
  readonly role: RoleResponse;
  readonly onDelete: () => void;
};

function TargetRoleItem({ role, onDelete }: Props) {
  return (
    <div className={styles.item}>
      <RoleInformation role={role} />
      <IconButton size="small" className={styles.closeIcon} onClick={onDelete}>
        <Close />
      </IconButton>
    </div>
  );
}

export default TargetRoleItem;
