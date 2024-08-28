import { type RoleResponse, RoleType, ApplicationType } from '@logto/schemas';
import classNames from 'classnames';

import type { GetArrayElementType } from '@/cloud/types/router';
import ApplicationIcon from '@/components/ApplicationIcon';
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
        {entities.map((entity) =>
          type === RoleType.User ? (
            <UserAvatar key={entity.id} className={styles.avatar} user={entity} size="small" />
          ) : (
            <ApplicationIcon
              key={entity.id}
              type={ApplicationType.MachineToMachine}
              className={classNames(styles.applicationIcon, styles.avatar)}
            />
          )
        )}
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
