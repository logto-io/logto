import { OrganizationInvitationStatus } from '@logto/schemas';
import { format } from 'date-fns';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import UsersEmptyDark from '@/assets/images/users-empty-dark.svg';
import UsersEmpty from '@/assets/images/users-empty.svg';
import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantInvitationResponse } from '@/cloud/types/router';
import ActionsButton from '@/components/ActionsButton';
import { RoleOption } from '@/components/OrganizationRolesSelect';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag, { type Props as TagProps } from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';

const convertInvitationStatusToTagStatus = (
  status: OrganizationInvitationStatus
): TagProps['status'] => {
  switch (status) {
    case OrganizationInvitationStatus.Pending: {
      return 'alert';
    }
    case OrganizationInvitationStatus.Accepted: {
      return 'success';
    }
    case OrganizationInvitationStatus.Revoked: {
      return 'error';
    }
    default: {
      return 'info';
    }
  }
};

function Invitations() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tenant_members' });
  const cloudApi = useAuthedCloudApi();
  const { currentTenantId } = useContext(TenantsContext);

  const { data, error, isLoading, mutate } = useSWR<TenantInvitationResponse[], RequestError>(
    `api/tenant/${currentTenantId}/invitations`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId: currentTenantId } })
  );

  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <>
      <Table
        isRowHoverEffectDisabled
        placeholder={
          <TablePlaceholder
            image={<UsersEmpty />}
            imageDark={<UsersEmptyDark />}
            title="tenant_members.invitation_empty_placeholder.title"
            description="tenant_members.invitation_empty_placeholder.description"
            action={
              <Button
                title="tenant_members.invite_member"
                type="primary"
                size="large"
                icon={<Plus />}
                onClick={() => {
                  setShowInviteModal(true);
                }}
              />
            }
          />
        }
        isLoading={isLoading}
        errorMessage={error?.toString()}
        rowGroups={[{ key: 'data', data }]}
        columns={[
          {
            dataIndex: 'user',
            colSpan: 4,
            title: t('user'),
            render: ({ invitee }) => <span>{invitee}</span>,
          },
          {
            dataIndex: 'roles',
            colSpan: 4,
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
            dataIndex: 'status',
            colSpan: 4,
            title: t('invitation_status'),
            render: ({ status }) => (
              <Tag type="state" status={convertInvitationStatusToTagStatus(status)}>
                {status}
              </Tag>
            ),
          },
          {
            dataIndex: 'sentAt',
            colSpan: 4,
            title: t('invitation_sent'),
            render: ({ createdAt }) => <span>{format(createdAt, 'MMM do, yyyy')}</span>,
          },
          {
            dataIndex: 'expiresAt',
            colSpan: 4,
            title: t('expiration_date'),
            render: ({ expiresAt }) => <span>{format(expiresAt, 'MMM do, yyyy')}</span>,
          },
          {
            dataIndex: 'actions',
            title: null,
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
      {/* TODO: Implemented in the follow-up PR */}
      {/* {showInviteModal && <InviteModal isOpen={showInviteModal} />} */}
    </>
  );
}

export default Invitations;
