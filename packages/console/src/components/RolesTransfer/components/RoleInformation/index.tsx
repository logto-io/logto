import { RoleType, type ScopeResponse, isManagementApi, type RoleResponse } from '@logto/schemas';
import useSWR from 'swr';

import ManagementApiAccessFlag from '@/assets/icons/management-api-access.svg?react';
import DynamicT from '@/ds-components/DynamicT';
import { Tooltip } from '@/ds-components/Tip';

import styles from './index.module.scss';

type Props = {
  readonly role: RoleResponse;
};

function RoleInformation({ role }: Props) {
  const { id, name, type } = role;
  const { data } = useSWR<ScopeResponse[]>(
    type === RoleType.MachineToMachine && `api/roles/${id}/scopes`
  );

  const withManagementApiFlag = data?.some(({ resource: { indicator } }) =>
    isManagementApi(indicator)
  );

  return (
    <div className={styles.container}>
      <div className={styles.name}>{name}</div>
      {withManagementApiFlag && (
        <Tooltip
          anchorClassName={styles.flag}
          content={<DynamicT forKey="roles.with_management_api_access_tip" />}
        >
          <ManagementApiAccessFlag />
        </Tooltip>
      )}
    </div>
  );
}

export default RoleInformation;
