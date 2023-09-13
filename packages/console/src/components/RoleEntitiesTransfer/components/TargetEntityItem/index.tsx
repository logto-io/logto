import type { User, Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';

import Close from '@/assets/icons/close.svg';
import ApplicationIcon from '@/components/ApplicationIcon';
import UserAvatar from '@/components/UserAvatar';
import IconButton from '@/ds-components/IconButton';
import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { getUserTitle } from '@/utils/user';

import { isUser } from '../../utils';

import * as styles from './index.module.scss';

type Props<T> = {
  entity: T;
  onDelete: () => void;
};

function TargetEntityItem<T extends User | Application>({ entity, onDelete }: Props<T>) {
  return (
    <div className={styles.item}>
      <div className={styles.meta}>
        {isUser(entity) ? (
          <UserAvatar hasTooltip user={entity} size="micro" />
        ) : (
          <ApplicationIcon type={ApplicationType.MachineToMachine} className={styles.icon} />
        )}
        <div className={styles.title}>{isUser(entity) ? getUserTitle(entity) : entity.name}</div>
        {isUser(entity) && entity.isSuspended && <SuspendedTag className={styles.suspended} />}
      </div>
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
}

export default TargetEntityItem;
