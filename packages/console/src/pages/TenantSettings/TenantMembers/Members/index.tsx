import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantMemberResponse } from '@/cloud/types/router';
import ActionsButton from '@/components/ActionsButton';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import UserPreview from '@/components/ItemPreview/UserPreview';
import { RoleOption } from '@/components/OrganizationRolesSelect';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';

import EditMemberModal from '../EditMemberModal';

import * as styles from './index.module.scss';

function Members() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.tenant_members' });
  const cloudApi = useAuthedCloudApi();
  const { currentTenantId } = useContext(TenantsContext);

  const { data, error, isLoading, mutate } = useSWR<TenantMemberResponse[], RequestError>(
    `api/tenant/${currentTenantId}/members`,
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
            render: (user) => <UserPreview user={user} userDetailsLink={false} />,
          },
          {
            dataIndex: 'roles',
            title: t('roles'),
            colSpan: 6,
            render: ({ organizationRoles }) => {
              if (organizationRoles.length === 0) {
                return '-';
              }

              return (
                <div className={styles.roles}>
                  {organizationRoles.map(({ id, name }) => (
                    <Tag key={id} variant="cell">
                      <RoleOption value={id} title={name} />
                    </Tag>
                  ))}
                </div>
              );
            },
          },
          {
            dataIndex: 'actions',
            title: null,
            colSpan: 1,
            render: (user) => (
              <ActionsButton
                deleteConfirmation="organization_details.remove_user_from_organization_description"
                fieldName="organization_details.user"
                textOverrides={{
                  edit: 'organization_details.edit_organization_roles',
                  delete: 'organization_details.remove_user_from_organization',
                  deleteConfirmation: 'general.remove',
                }}
                onEdit={() => {
                  setUserToBeEdited(user);
                }}
                onDelete={async () => {
                  await cloudApi.delete(`/api/tenants/:tenantId/members/:userId`, {
                    params: { tenantId: currentTenantId, userId: user.id },
                  });
                  void mutate();
                }}
              />
            ),
          },
        ]}
        rowIndexKey="id"
      />
      {userToBeEdited && (
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
