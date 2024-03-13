import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantInvitationResponse } from '@/cloud/types/router';
import ActionsButton from '@/components/ActionsButton';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { RoleOption } from '@/components/OrganizationRolesSelect';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';

function Invitations() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tenant_members' });
  const cloudApi = useAuthedCloudApi();
  const { currentTenantId } = useContext(TenantsContext);

  const { data, error, isLoading, mutate } = useSWR<TenantInvitationResponse[], RequestError>(
    `api/tenant/${currentTenantId}/invitations`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId: currentTenantId } })
  );

  return (
    <Table
      isRowHoverEffectDisabled
      placeholder={<EmptyDataPlaceholder />}
      isLoading={isLoading}
      errorMessage={error?.toString()}
      rowGroups={[{ key: 'data', data }]}
      columns={[
        {
          dataIndex: 'user',
          title: t('user'),
          render: (invitation) => <span>{invitation.invitee}</span>,
        },
        {
          dataIndex: 'roles',
          title: t('roles'),
          render: ({ organizationRoles }) => {
            if (organizationRoles.length === 0) {
              return '-';
            }

            return organizationRoles.map(({ id, name }) => (
              <Tag key={id} variant="cell">
                <RoleOption value={id} title={name} />
              </Tag>
            ));
          },
        },
        {
          dataIndex: 'actions',
          title: null,
          colSpan: 1,
          render: (invitation) => (
            <ActionsButton
              deleteConfirmation="tenant_members.delete_user_confirm"
              fieldName="tenant_members.user"
              textOverrides={{
                edit: 'tenant_members.menu_options.resend_invite',
                delete: 'tenant_members.menu_options.revoke',
                deleteConfirmation: 'general.remove',
              }}
              onDelete={async () => {
                await cloudApi.delete(`/api/tenants/:tenantId/invitations/:invitationId`, {
                  params: { tenantId: currentTenantId, invitationId: invitation.id },
                });
                void mutate();
              }}
            />
          ),
        },
      ]}
      rowIndexKey="id"
    />
  );
}

export default Invitations;
