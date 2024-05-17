import { type Application, type User } from '@logto/schemas';

import ApplicationIcon from '@/components/ApplicationIcon';
import UserAvatar from '@/components/UserAvatar';
import SuspendedTag from '@/pages/Users/components/SuspendedTag';
import { getUserTitle } from '@/utils/user';

import * as styles from './index.module.scss';

type UserItemProps = {
  readonly entity: User;
};

export function UserItem({ entity }: UserItemProps) {
  return (
    <>
      <UserAvatar hasTooltip user={entity} size="micro" />
      <div className={styles.title}>{getUserTitle(entity)}</div>
      {entity.isSuspended && <SuspendedTag className={styles.suspended} />}
    </>
  );
}

type ApplicationItemProps = {
  readonly entity: Application;
};

export function ApplicationItem({ entity }: ApplicationItemProps) {
  return (
    <>
      <ApplicationIcon type={entity.type} className={styles.icon} />
      <div className={styles.title}>{entity.name}</div>
    </>
  );
}
