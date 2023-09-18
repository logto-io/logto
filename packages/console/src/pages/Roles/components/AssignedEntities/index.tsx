import { type RoleResponse, RoleType } from '@logto/schemas';
import classNames from 'classnames';

import MachineToMachineRole from '@/assets/icons/m2m-role.svg';
import type { GetArrayElementType } from '@/cloud/types/router';
import UserAvatar from '@/components/UserAvatar';
import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type User = GetArrayElementType<RoleResponse['featuredUsers']>;
type Application = GetArrayElementType<RoleResponse['featuredApplications']>;

type Props =
  | {
      type: RoleType.User;
      entities: User[];
      count: number;
    }
  | {
      type: RoleType.MachineToMachine;
      entities: Application[];
      count: number;
    };

function AssignedEntities({ entities, count, type }: Props) {
  return count ? (
    <div className={styles.entities}>
      <div className={styles.avatars}>
        {type === RoleType.User
          ? entities.map((entity) => (
              <UserAvatar key={entity.id} className={styles.avatar} user={entity} size="small" />
            ))
          : Array.from({ length: entities.length }, () => (
              // eslint-disable-next-line react/jsx-key
              <MachineToMachineRole className={classNames(styles.applicationIcon, styles.avatar)} />
            ))}
      </div>
      <span className={styles.count}>
        <DynamicT
          forKey={
            count >= 2
              ? type === RoleType.User
                ? 'roles.user_counts'
                : 'roles.application_counts'
              : type === RoleType.User
              ? 'roles.user_count'
              : 'roles.application_count'
          }
          interpolation={{ count }}
        />
      </span>
    </div>
  ) : (
    <div className={styles.empty}>-</div>
  );
}

export default AssignedEntities;
