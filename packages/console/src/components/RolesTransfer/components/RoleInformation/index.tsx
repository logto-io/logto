import { RoleType, type ScopeResponse, isManagementApi, type RoleResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ManagementApiAccessFlag from '@/assets/icons/management-api-access.svg';
import { isDevFeaturesEnabled } from '@/consts/env';
import DynamicT from '@/ds-components/DynamicT';
import { Tooltip } from '@/ds-components/Tip';

import * as styles from './index.module.scss';

type Props = {
  readonly role: RoleResponse;
};

function RoleInformation({ role }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { id, name, type, usersCount, applicationsCount } = role;
  const { data } = useSWR<ScopeResponse[]>(
    // Todo @xiaoyijun remove dev feature flag
    isDevFeaturesEnabled && type === RoleType.MachineToMachine && `api/roles/${id}/scopes`
  );

  const withManagementApiFlag = data?.some(({ resource: { indicator } }) =>
    isManagementApi(indicator)
  );

  return (
    <div className={styles.container}>
      <div className={styles.name}>{name}</div>
      {!isDevFeaturesEnabled && (
        <div className={styles.count}>
          (
          {type === RoleType.User
            ? t('user_details.roles.assigned_user_count', { value: usersCount })
            : t('application_details.roles.assigned_app_count', { value: applicationsCount })}
          )
        </div>
      )}
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
