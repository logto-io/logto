import { OrganizationInvitationStatus, TenantRole } from '@logto/schemas';
import { condArray, conditional } from '@silverhand/essentials';
import { format } from 'date-fns';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg';
import Invite from '@/assets/icons/invitation.svg';
import More from '@/assets/icons/more.svg';
import Plus from '@/assets/icons/plus.svg';
import Redo from '@/assets/icons/redo.svg';
import UsersEmptyDark from '@/assets/images/users-empty-dark.svg';
import UsersEmpty from '@/assets/images/users-empty.svg';
import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import type { InvitationResponse, TenantInvitationResponse } from '@/cloud/types/router';
import Breakable from '@/components/Breakable';
import { RoleOption } from '@/components/OrganizationRolesSelect';
import { TenantsContext } from '@/contexts/TenantsProvider';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag, { type Props as TagProps } from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import InviteMemberModal from '../InviteMemberModal';

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
  const {
    access: { canInviteMember, canRemoveMember },
  } = useCurrentTenantScopes();

  const { data, error, isLoading, mutate } = useSWR<TenantInvitationResponse[], RequestError>(
    `api/tenants/${currentTenantId}/invitations`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId: currentTenantId } })
  );

  const [showInviteModal, setShowInviteModal] = useState(false);
  const { show } = useConfirmModal();

  const handleRevoke = async (invitationId: string) => {
    const [result] = await show({
      ModalContent: t('revoke_invitation_confirm'),
      confirmButtonText: 'general.confirm',
    });

    if (!result) {
      return;
    }

    await cloudApi.patch(`/api/tenants/:tenantId/invitations/:invitationId/status`, {
      params: { tenantId: currentTenantId, invitationId },
      body: { status: OrganizationInvitationStatus.Revoked },
    });
    void mutate();
    toast.success(t('messages.invitation_revoked'));
  };

  const handleDelete = async (invitationId: string) => {
    const [result] = await show({
      ModalContent: t('delete_user_confirm'),
      confirmButtonText: 'general.delete',
    });

    if (!result) {
      return;
    }

    await cloudApi.delete(`/api/tenants/:tenantId/invitations/:invitationId`, {
      params: { tenantId: currentTenantId, invitationId },
    });
    void mutate();
    toast.success(t('messages.invitation_deleted'));
  };

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
            action={conditional(
              canInviteMember && (
                <Button
                  title="tenant_members.invite_members"
                  type="primary"
                  size="large"
                  icon={<Plus />}
                  onClick={() => {
                    setShowInviteModal(true);
                  }}
                />
              )
            )}
          />
        }
        isLoading={isLoading}
        errorMessage={error?.toString()}
        rowGroups={[{ key: 'data', data }]}
        columns={[
          {
            dataIndex: 'user',
            colSpan: 2,
            title: t('user'),
            render: ({ invitee }) => <Breakable>{invitee}</Breakable>,
          },
          {
            dataIndex: 'roles',
            colSpan: 2,
            title: t('roles'),
            render: ({ organizationRoles }) => {
              if (organizationRoles.length === 0) {
                return '-';
              }

              return organizationRoles.map(({ id }) => (
                <Tag key={id} variant="cell">
                  <RoleOption
                    value={id}
                    title={t(id === TenantRole.Admin ? 'admin' : 'collaborator')}
                  />
                </Tag>
              ));
            },
          },
          {
            dataIndex: 'status',
            colSpan: 2,
            title: t('invitation_status'),
            render: ({ status }) => (
              <Tag type="state" status={convertInvitationStatusToTagStatus(status)}>
                {status}
              </Tag>
            ),
          },
          {
            dataIndex: 'inviter',
            colSpan: 3,
            title: t('inviter'),
            render: ({ inviterName }) => <Breakable>{inviterName ?? '-'}</Breakable>,
          },
          {
            dataIndex: 'expiresAt',
            colSpan: 2,
            title: t('expiration_date'),
            render: ({ expiresAt }) => <span>{format(expiresAt, 'MMM do, yyyy')}</span>,
          },
          ...condArray(
            (canInviteMember || canRemoveMember) && [
              {
                dataIndex: 'actions',
                title: null,
                render: ({ id, status }: InvitationResponse) => (
                  <ActionMenu
                    icon={<More />}
                    iconSize="small"
                    title={<DynamicT forKey="general.more_options" />}
                  >
                    {status === OrganizationInvitationStatus.Pending && canInviteMember && (
                      <ActionMenuItem
                        icon={<Invite />}
                        onClick={async () => {
                          await cloudApi.post(
                            '/api/tenants/:tenantId/invitations/:invitationId/message',
                            {
                              params: { tenantId: currentTenantId, invitationId: id },
                            }
                          );
                          toast.success(t('messages.invitation_sent'));
                        }}
                      >
                        {t('menu_options.resend_invite')}
                      </ActionMenuItem>
                    )}
                    {status === OrganizationInvitationStatus.Pending && canRemoveMember && (
                      <ActionMenuItem
                        icon={<Redo />}
                        type="danger"
                        onClick={() => {
                          void handleRevoke(id);
                        }}
                      >
                        {t('menu_options.revoke')}
                      </ActionMenuItem>
                    )}
                    {status !== OrganizationInvitationStatus.Pending && canRemoveMember && (
                      <ActionMenuItem
                        icon={<Delete />}
                        type="danger"
                        onClick={() => {
                          void handleDelete(id);
                        }}
                      >
                        {t('menu_options.delete_invitation_record')}
                      </ActionMenuItem>
                    )}
                  </ActionMenu>
                ),
              },
            ]
          ),
        ]}
        rowIndexKey="id"
      />
      {canInviteMember && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            void mutate();
          }}
        />
      )}
    </>
  );
}

export default Invitations;
