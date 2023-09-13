import type { User, Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';

import ApplicationIcon from '@/components/ApplicationIcon';
import UserAvatar from '@/components/UserAvatar';
import Checkbox from '@/ds-components/Checkbox';
import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { onKeyDownHandler } from '@/utils/a11y';
import { getUserTitle } from '@/utils/user';

import { isUser } from '../../utils';

import * as styles from './index.module.scss';

type Props<T> = {
  entity: T;
  isSelected: boolean;
  onSelect: () => void;
};

function SourceEntityItem<T extends User | Application>({
  entity,
  isSelected,
  onSelect,
}: Props<T>) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.item}
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
      {isUser(entity) ? (
        <UserAvatar hasTooltip user={entity} size="micro" />
      ) : (
        <ApplicationIcon type={ApplicationType.MachineToMachine} className={styles.icon} />
      )}
      <div className={styles.title}>{isUser(entity) ? getUserTitle(entity) : entity.name}</div>
      {isUser(entity) && entity.isSuspended && <SuspendedTag className={styles.suspended} />}
    </div>
  );
}

export default SourceEntityItem;
