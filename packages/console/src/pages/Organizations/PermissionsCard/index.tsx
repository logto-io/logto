import { type OrganizationScope } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

import ActionsButton from '@/components/ActionsButton';
import FormCard from '@/components/FormCard';
import Tag from '@/ds-components/Tag';
import useApi, { type RequestError } from '@/hooks/use-api';
import { buildUrl } from '@/utils/url';

import PermissionModal from '../PermissionModal';
import { swrKey } from '../RolesCard';
import TemplateTable, { pageSize } from '../TemplateTable';

/**
 * Renders the permissions card that allows users to add, edit, and delete organization
 * permissions.
 */
function PermissionsCard() {
  const [page, setPage] = useState(1);
  const {
    data: response,
    error,
    mutate: mutatePermissions,
  } = useSWR<[OrganizationScope[], number], RequestError>(
    buildUrl('api/organization-scopes', {
      page: String(page),
      page_size: String(pageSize),
    })
  );
  const { mutate: globalMutate } = useSWRConfig();
  const [data, totalCount] = response ?? [[], 0];
  const api = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [editData, setEditData] = useState<Nullable<OrganizationScope>>(null);
  const mutate = useCallback(() => {
    void mutatePermissions();
    // Mutate roles field to update the permissions list
    void globalMutate((key) => typeof key === 'string' && key.startsWith(swrKey));
  }, [mutatePermissions, globalMutate]);

  const isLoading = !response && !error;

  return (
    <FormCard
      title="organizations.organization_permission_other"
      description="organizations.organization_permission_description"
    >
      <PermissionModal
        isOpen={isModalOpen}
        editData={editData}
        onClose={() => {
          setIsModalOpen(false);
          mutate();
        }}
      />
      <TemplateTable
        rowIndexKey="id"
        isLoading={isLoading}
        page={page}
        totalCount={totalCount}
        data={data}
        columns={[
          {
            title: t('general.name'),
            dataIndex: 'name',
            colSpan: 4,
            render: ({ name }) => <Tag variant="cell">{name}</Tag>,
          },
          {
            title: t('general.description'),
            dataIndex: 'description',
            colSpan: 6,
            render: ({ description }) => description ?? '-',
          },
          {
            title: null,
            dataIndex: 'delete',
            render: (data) => (
              <ActionsButton
                fieldName="organizations.permission"
                deleteConfirmation="organizations.organization_permission_delete_confirm"
                onEdit={() => {
                  setEditData(data);
                  setIsModalOpen(true);
                }}
                onDelete={async () => {
                  await api.delete(`api/organization-scopes/${data.id}`);
                  mutate();
                }}
              />
            ),
          },
        ]}
        onPageChange={setPage}
        onAdd={() => {
          setEditData(null);
          setIsModalOpen(true);
        }}
      />
    </FormCard>
  );
}

export default PermissionsCard;
