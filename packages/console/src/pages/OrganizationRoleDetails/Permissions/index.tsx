import { type Scope, type OrganizationScope } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
import useApi from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';

import ResourceName from './ResourceName';
import * as styles from './index.module.scss';
import useOrganizationRoleScopes from './use-organization-role-scopes';

type OrganizationRoleScope = OrganizationScope | Scope;

const isResourceScope = (scope: OrganizationRoleScope): scope is Scope => 'resourceId' in scope;

type Props = {
  organizationRoleId: string;
};

function Permissions({ organizationRoleId }: Props) {
  const organizationRolePath = `api/organization-roles/${organizationRoleId}`;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const { organizationScopes, resourceScopes, error, isLoading, mutate } =
    useOrganizationRoleScopes(organizationRoleId);

  const [{ keyword }, updateSearchParameters] = useSearchParametersWatcher({
    keyword: '',
  });

  const filterScopes = useCallback(
    (scopes: OrganizationRoleScope[]) => scopes.filter(({ name }) => name.includes(keyword)),
    [keyword]
  );

  const filteredScopes = useMemo(
    () =>
      keyword
        ? [...filterScopes(resourceScopes), ...filterScopes(organizationScopes)]
        : [...resourceScopes, ...organizationScopes],
    [filterScopes, keyword, organizationScopes, resourceScopes]
  );

  const [editOrganizationScope, setEditOrganizationScope] = useState<OrganizationScope>();

  const removeScopeHandler = useCallback(
    (scopeToRemove: OrganizationRoleScope) => async () => {
      const deleteSubpath = isResourceScope(scopeToRemove) ? 'resource-scopes' : 'scopes';
      await api.delete(`${organizationRolePath}/${deleteSubpath}/${scopeToRemove.id}`);

      toast.success(
        t('organization_role_details.permissions.removed', { name: scopeToRemove.name })
      );
      mutate();
    },
    [api, mutate, organizationRolePath, t]
  );

  const editScopeHandler = useCallback(
    (scopeToEdit: OrganizationRoleScope) => async () => {
      if (isResourceScope(scopeToEdit)) {
        // Todo @xiaoyijun support resource scope editing

        return;
      }

      setEditOrganizationScope(scopeToEdit);
    },
    []
  );

  return (
    <>
      <Table
        rowGroups={[{ key: 'organizationRolePermissions', data: filteredScopes }]}
        rowIndexKey="id"
        columns={[
          {
            title: <DynamicT forKey="organization_role_details.permissions.name_column" />,
            dataIndex: 'name',
            colSpan: 5,
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
            colSpan: 5,
            render: ({ description }) => <Breakable>{description ?? '-'}</Breakable>,
          },
          {
            title: <DynamicT forKey="organization_role_details.permissions.type_column" />,
            dataIndex: 'type',
            colSpan: 5,
            render: (scope) => {
              return (
                <Breakable>
                  {isResourceScope(scope) ? (
                    <>
                      <DynamicT forKey="organization_role_details.permissions.type.api" />
                      <ResourceName resourceId={scope.resourceId} />
                    </>
                  ) : (
                    <DynamicT forKey="organization_role_details.permissions.type.org" />
                  )}
                </Breakable>
              );
            },
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
                onEdit={editScopeHandler(scope)}
                onDelete={removeScopeHandler(scope)}
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
        onRetry={mutate}
      />
      {editOrganizationScope && (
        <ManageOrganizationPermissionModal
          data={editOrganizationScope}
          onClose={() => {
            setEditOrganizationScope(undefined);
            mutate();
          }}
        />
      )}
    </>
  );
}

export default Permissions;
