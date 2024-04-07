import { type OrganizationScope } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ManageOrganizationPermissionModal from '@/components/ManageOrganizationPermissionModal';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import useApi, { type RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';

import * as styles from './index.module.scss';

const organizationRolesPath = 'api/organization-roles';

type Props = {
  organizationRoleId: string;
};

function Permissions({ organizationRoleId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const { data, error, isLoading, mutate } = useSWR<OrganizationScope[], RequestError>(
    `${organizationRolesPath}/${organizationRoleId}/scopes`
  );

  const [{ keyword }, updateSearchParameters] = useSearchParametersWatcher({
    keyword: '',
  });

  const filteredData = useMemo(() => {
    if (keyword) {
      return data?.filter((roleScope) => roleScope.name.includes(keyword));
    }
    return data;
  }, [data, keyword]);

  const [editPermission, setEditPermission] = useState<OrganizationScope>();

  const scopeRemoveHandler = useCallback(
    (scopeToRemove: OrganizationScope) => async () => {
      await api.put(`${organizationRolesPath}/${organizationRoleId}/scopes`, {
        json: {
          organizationScopeIds:
            data?.filter((scope) => scope.id !== scopeToRemove.id).map(({ id }) => id) ?? [],
        },
      });
      toast.success(
        t('organization_role_details.permissions.removed', { name: scopeToRemove.name })
      );
      void mutate();
    },
    [api, data, mutate, organizationRoleId, t]
  );

  return (
    <>
      <Table
        rowGroups={[{ key: 'organizationRolePermissions', data: filteredData }]}
        rowIndexKey="id"
        columns={[
          {
            title: <DynamicT forKey="organization_role_details.permissions.name_column" />,
            dataIndex: 'name',
            colSpan: 7,
            render: ({ name }) => {
              return (
                <Tag variant="cell">
                  <Breakable>{name}</Breakable>
                </Tag>
              );
            },
          },
          {
            title: <DynamicT forKey="organization_role_details.permissions.description_column" />,
            dataIndex: 'description',
            colSpan: 8,
            render: ({ description }) => <Breakable>{description ?? '-'}</Breakable>,
          },
          {
            title: null,
            dataIndex: 'action',
            colSpan: 1,
            render: (scope) => (
              <ActionsButton
                fieldName="organization_role_details.permissions.name_column"
                deleteConfirmation="organization_role_details.permissions.remove_confirmation"
                textOverrides={{
                  delete: 'organization_role_details.permissions.remove_permission',
                  deleteConfirmation: 'general.remove',
                }}
                onEdit={() => {
                  setEditPermission(scope);
                }}
                onDelete={async () => {
                  await scopeRemoveHandler(scope)();
                }}
              />
            ),
          },
        ]}
        filter={
          <div className={styles.filter}>
            <Search
              isClearable={Boolean(keyword)}
              placeholder={t('organization_template.permissions.search_placeholder')}
              defaultValue={keyword}
              onSearch={(keyword) => {
                if (keyword) {
                  updateSearchParameters({ keyword });
                }
              }}
              onClearSearch={() => {
                updateSearchParameters({ keyword: '' });
              }}
            />
            <Button
              title="organization_role_details.permissions.assign_permissions"
              className={styles.assignButton}
              type="primary"
              icon={<Plus />}
              onClick={() => {
                // Todo @xiaoyijun Assign permissions to org role
              }}
            />
          </div>
        }
        placeholder={<EmptyDataPlaceholder />}
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        onRetry={async () => mutate(undefined, true)}
      />
      {editPermission && (
        <ManageOrganizationPermissionModal
          data={editPermission}
          onClose={() => {
            setEditPermission(undefined);
            void mutate();
          }}
        />
      )}
    </>
  );
}

export default Permissions;
