import {
  OrganizationInvitationStatus,
  getTenantIdFromOrganizationId,
  type TenantTag,
} from '@logto/schemas';
import { useContext } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import TenantEnvTag from '@/components/TenantEnvTag';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';

import * as styles from './index.module.scss';

type Props = {
  data: {
    id: string;
    organizationId: string;
    tenantName: string;
    tenantTag: TenantTag;
  };
};

function TenantInvitationDropdownItem({ data }: Props) {
  const cloudApi = useCloudApi();
  const { navigateTenant, resetTenants } = useContext(TenantsContext);
  const { id, organizationId, tenantName, tenantTag } = data;

  return (
    <div className={styles.item}>
      <div className={styles.meta}>
        <div className={styles.name}>{tenantName}</div>
        <TenantEnvTag tag={tenantTag} />
      </div>
      <Button
        size="small"
        type="outline"
        title="general.join"
        onClick={async () => {
          await cloudApi.patch(`/api/invitations/:invitationId/status`, {
            params: { invitationId: id },
            body: { status: OrganizationInvitationStatus.Accepted },
          });
          const data = await cloudApi.get('/api/tenants');
          resetTenants(data);
          navigateTenant(getTenantIdFromOrganizationId(organizationId));
        }}
      />
    </div>
  );
}

export default TenantInvitationDropdownItem;
