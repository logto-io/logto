import { type OrganizationScope } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FormField from '@/ds-components/FormField';
import useApi, { type RequestError } from '@/hooks/use-api';
import ActionsButton from '@/pages/Organizations/ActionsButton';
import { buildUrl } from '@/utils/url';

import PermissionModal from '../PermissionModal';
import TemplateTable, { pageSize } from '../TemplateTable';

/**
 * Renders the permissions field that allows users to add, edit, and delete organization
 * permissions.
 */
function PermissionsField() {
  const [page, setPage] = useState(1);
  const {
    data: response,
    error,
    mutate,
  } = useSWR<[OrganizationScope[], number], RequestError>(
    buildUrl('api/organization-scopes', {
      page: String(page),
      page_size: String(pageSize),
    })
  );

  const [data, totalCount] = response ?? [[], 0];
  const api = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [editData, setEditData] = useState<Nullable<OrganizationScope>>(null);

  const isLoading = !response && !error;

  if (isLoading) {
    return <>loading</>; // TODO: loading state
  }

  return (
    <FormField title="organizations.organization_permission_other">
      <PermissionModal
        isOpen={isModalOpen}
        editData={editData}
        onFinish={() => {
          setIsModalOpen(false);
          void mutate();
        }}
      />
      <TemplateTable
        rowIndexKey="id"
        page={page}
        totalCount={totalCount}
        data={data}
        columns={[
          {
            title: t('general.name'),
            dataIndex: 'name',
            colSpan: 4,
            render: ({ name }) => <div>{name}</div>,
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
                content="Delete at your own risk, mate."
                onEdit={() => {
                  setEditData(data);
                  setIsModalOpen(true);
                }}
                onDelete={async () => {
                  await api.delete(`api/organization-scopes/${data.id}`);
                  void mutate();
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
    </FormField>
  );
}

export default PermissionsField;
