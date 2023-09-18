import type { Application, User, RoleType } from '@logto/schemas';
import classNames from 'classnames';

import * as transferLayout from '@/scss/transfer.module.scss';

import SourceEntitiesBox from './components/SourceEntitiesBox';
import TargetEntitiesBox from './components/TargetEntitiesBox';
import * as styles from './index.module.scss';

type Props<T> = {
  roleId: string;
  roleType: RoleType;
  value: T[];
  onChange: (value: T[]) => void;
};

function RoleEntitiesTransfer<T extends User | Application>({
  roleId,
  roleType,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className={classNames(transferLayout.container, styles.rolesTransfer)}>
      <SourceEntitiesBox
        roleId={roleId}
        roleType={roleType}
        selectedEntities={value}
        onChange={onChange}
      />
      <div className={transferLayout.verticalBar} />
      <TargetEntitiesBox selectedEntities={value} onChange={onChange} />
    </div>
  );
}

export default RoleEntitiesTransfer;
