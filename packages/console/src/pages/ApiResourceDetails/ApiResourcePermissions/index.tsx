import { isManagementApi, type Resource, type ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import PermissionsTable from '@/components/PermissionsTable';
import { defaultPageSize } from '@/consts';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import CreatePermissionModal from './components/CreatePermissionModal';

const pageSize = defaultPageSize;

type Props = {
  resource: Resource;
};

function ApiResourcePermissions({ resource }: Props) {
  const { id: resourceId, indicator } = resource;
  const isLogtoManagementApiResource = isManagementApi(indicator);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [{ page, keyword }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
    keyword: '',
  });

  const { data, error, mutate } = useSWR<[ScopeResponse[], number], RequestError>(
    resourceId &&
      buildUrl(`api/resources/${resourceId}/scopes`, {
        page: String(page),
        page_size: String(pageSize),
        ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
      })
  );

  const isLoading = !data && !error;
  const [scopes, totalCount] = data ?? [];

  const api = useApi();

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const handleDelete = async (scopeToBeDeleted: ScopeResponse) => {
    await api.delete(`api/resources/${resourceId}/scopes/${scopeToBeDeleted.id}`);
    toast.success(t('api_resource_details.permission.deleted', { name: scopeToBeDeleted.name }));
    await mutate();
  };

  return (
    <>
      <PermissionsTable
        isCreateGuideVisible
        scopes={scopes}
        isLoading={isLoading}
        isReadOnly={isLogtoManagementApiResource}
        createButtonTitle="api_resource_details.permission.create_button"
        createHandler={() => {
          setIsCreateFormOpen(true);
        }}
        deletionText={{
          actionButton: 'permissions.delete',
          confirmation: 'api_resource_details.permission.delete_description',
          confirmButton: 'general.delete',
        }}
        deleteHandler={handleDelete}
        errorMessage={error?.body?.message ?? error?.message}
        retryHandler={async () => mutate(undefined, true)}
        pagination={{
          page,
          pageSize,
          totalCount,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        }}
        search={{
          keyword,
          searchHandler: (keyword) => {
            updateSearchParameters({
              keyword,
              page: 1,
            });
          },
          clearSearchHandler: () => {
            updateSearchParameters({
              keyword: '',
              page: 1,
            });
          },
        }}
        onPermissionUpdated={mutate}
      />
      {isCreateFormOpen && totalCount !== undefined && (
        <CreatePermissionModal
          resourceId={resourceId}
          totalResourceCount={totalCount}
          onClose={(scope) => {
            if (scope) {
              toast.success(
                t('api_resource_details.permission.permission_created', { name: scope.name })
              );
              void mutate();
            }
            setIsCreateFormOpen(false);
          }}
        />
      )}
    </>
  );
}

export default ApiResourcePermissions;
