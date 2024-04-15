import { type Scope, type OrganizationScope } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import Plus from '@/assets/icons/plus.svg';
import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import EditScopeModal, { type EditScopeData } from '@/components/EditScopeModal';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import OrganizationRolePermissionsAssignmentModal from '@/components/OrganizationRolePermissionsAssignmentModal';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import useApi from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';

import { type OrganizationRoleDetailsOutletContext } from '../types';

import ResourceName from './ResourceName';
import * as styles from './index.module.scss';
import useOrganizationRoleScopes from './use-organization-role-scopes';

type OrganizationRoleScope = OrganizationScope | Scope;

const isResourceScope = (scope: OrganizationRoleScope): scope is Scope => 'resourceId' in scope;

function Permissions() {
  const {
    organizationRole: { id: organizationRoleId },
  } = useOutletContext<OrganizationRoleDetailsOutletContext>();

  const organizationRolePath = `api/organization-roles/${organizationRoleId}`;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const { organizationScopes, resourceScopes, error, isLoading, mutate } =
    useOrganizationRoleScopes(organizationRoleId);

  const [{ keyword }, updateSearchParameters] = useSearchParametersWatcher({
    keyword: '',
  });

  const filterScopesByKeyword = useCallback(
    (scopes: OrganizationRoleScope[]) => scopes.filter(({ name }) => name.includes(keyword)),
    [keyword]
  );

  const scopesData = useMemo(
    () =>
      keyword
        ? [...filterScopesByKeyword(resourceScopes), ...filterScopesByKeyword(organizationScopes)]
        : [...resourceScopes, ...organizationScopes],
    [filterScopesByKeyword, keyword, organizationScopes, resourceScopes]
  );

  const [editingScope, setEditingScope] = useState<OrganizationScope>();

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

  const handleEdit = async (scope: OrganizationRoleScope, editedData: EditScopeData) => {
    const patchApiEndpoint = isResourceScope(scope)
      ? `api/resources/${scope.resourceId}/scopes/${scope.id}`
      : `api/organization-scopes/${scope.id}`;
    await api.patch(patchApiEndpoint, { json: editedData });
    toast.success(t('general.saved'));
    mutate();
  };

  const [isAssignScopesModalOpen, setIsAssignScopesModalOpen] = useState(false);

  return (
    <>
      <Table
        rowGroups={[{ key: 'organizationRolePermissions', data: scopesData }]}
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
                onEdit={() => {
                  setEditingScope(scope);
                }}
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
                setIsAssignScopesModalOpen(true);
              }}
            />
          </div>
        }
        placeholder={<EmptyDataPlaceholder />}
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        onRetry={mutate}
      />
      {editingScope && (
        <EditScopeModal
          scopeName={editingScope.name}
          data={editingScope}
          text={
            isResourceScope(editingScope)
              ? {
                  title: 'permissions.edit_title',
                  nameField: 'api_resource_details.permission.name',
                  descriptionField: 'api_resource_details.permission.description',
                  descriptionPlaceholder: 'api_resource_details.permission.description_placeholder',
                }
              : {
                  title: 'organization_template.permissions.edit_title',
                  nameField: 'organization_template.permissions.permission_field_name',
                  descriptionField: 'organization_template.permissions.description_field_name',
                  descriptionPlaceholder:
                    'organization_template.permissions.description_field_placeholder',
                }
          }
          onSubmit={async (editedData) => {
            await handleEdit(editingScope, editedData);
          }}
          onClose={() => {
            setEditingScope(undefined);
          }}
        />
      )}
      <OrganizationRolePermissionsAssignmentModal
        organizationRoleId={organizationRoleId}
        isOpen={isAssignScopesModalOpen}
        onClose={() => {
          setIsAssignScopesModalOpen(false);
        }}
      />
    </>
  );
}

export default Permissions;
