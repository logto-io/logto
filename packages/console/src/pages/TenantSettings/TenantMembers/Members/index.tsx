import { TenantRole } from '@logto/schemas';
import { condArray, conditional } from '@silverhand/essentials';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantMemberResponse } from '@/cloud/types/router';
import ActionsButton from '@/components/ActionsButton';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import UserPreview from '@/components/ItemPreview/UserPreview';
import { RoleOption } from '@/components/OrganizationRolesSelect';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useCurrentUser from '@/hooks/use-current-user';

import EditMemberModal from '../EditMemberModal';

function Members() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tenant_members' });
  const cloudApi = useAuthedCloudApi();
  const { currentTenantId } = useContext(TenantsContext);
  const { user: currentUser } = useCurrentUser();
  const {
    access: { canRemoveMember, canUpdateMemberRole },
  } = useCurrentTenantScopes();
  const { mutateSubscriptionQuotaAndUsages } = useContext(SubscriptionDataContext);

  const { data, error, isLoading, mutate } = useSWR<TenantMemberResponse[], RequestError>(
    `api/tenants/${currentTenantId}/members`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/members', { params: { tenantId: currentTenantId } })
  );

  const [userToBeEdited, setUserToBeEdited] = useState<TenantMemberResponse>();

  return (
    <>
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
            colSpan: 4,
            render: (user) => <UserPreview user={user} showLink={false} />,
          },
          {
            dataIndex: 'roles',
            title: t('roles'),
            colSpan: 6,
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
          ...condArray(
            (canUpdateMemberRole || canRemoveMember) && [
              {
                dataIndex: 'actions',
                title: null,
                colSpan: 1,
                render: (user: TenantMemberResponse) => (
                  <ActionsButton
                    deleteConfirmation="tenant_members.delete_user_confirm"
                    fieldName="tenant_members.user"
                    textOverrides={{
                      edit: 'tenant_members.menu_options.edit',
                      delete: 'tenant_members.menu_options.delete',
                      deleteConfirmation: 'general.remove',
                    }}
                    onEdit={conditional(
                      canUpdateMemberRole &&
                        (() => {
                          setUserToBeEdited(user);
                        })
                    )}
                    onDelete={conditional(
                      canRemoveMember &&
                        // Cannot remove self from members list
                        currentUser?.id !== user.id &&
                        (async () => {
                          await cloudApi.delete(`/api/tenants/:tenantId/members/:userId`, {
                            params: { tenantId: currentTenantId, userId: user.id },
                          });
                          void mutate();
                          mutateSubscriptionQuotaAndUsages();
                        })
                    )}
                  />
                ),
              },
            ]
          ),
        ]}
        rowIndexKey="id"
      />
      {canUpdateMemberRole && userToBeEdited && (
        <EditMemberModal
          isOpen
          user={userToBeEdited}
          onClose={() => {
            setUserToBeEdited(undefined);
            void mutate();
          }}
        />
      )}
    </>
  );
}

export default Members;
