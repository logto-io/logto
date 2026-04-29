import Draggable from '@/assets/icons/draggable.svg?react';
import Minus from '@/assets/icons/minus.svg?react';
import IconButton from '@/ds-components/IconButton';

import styles from './ProfileFieldItem.module.scss';

type Props = {
  readonly label: string;
  readonly onDelete: () => void;
};

function ProfileFieldItem({ label, onDelete }: Props) {
  return (
    <div className={styles.profileFieldItem}>
      <div className={styles.profileField}>
        <Draggable className={styles.draggableIcon} />
        {label}
      </div>
      <IconButton onClick={onDelete}>
        <Minus />
      </IconButton>
    </div>
  );
}

export default ProfileFieldItem;
