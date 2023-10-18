import { type OrganizationScope } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import DeleteButton from '@/components/DeleteButton';
import FormField from '@/ds-components/FormField';
import useApi, { type RequestError } from '@/hooks/use-api';
import { buildUrl } from '@/utils/url';

import CreatePermissionModal from '../CreatePermissionModal';
import TemplateTable, { pageSize } from '../TemplateTable';
import * as styles from '../index.module.scss';

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

  const isLoading = !response && !error;

  if (isLoading) {
    return <>loading</>; // TODO: loading state
  }

  return (
    <FormField title="organizations.organization_permissions">
      <CreatePermissionModal
        isOpen={isModalOpen}
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
            render: ({ name }) => <div className={styles.permission}>{name}</div>,
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
            render: ({ id }) => (
              <DeleteButton
                content="Delete at your own risk, mate."
                onDelete={async () => {
                  await api.delete(`api/organization-scopes/${id}`);
                  void mutate();
                }}
              />
            ),
          },
        ]}
        onPageChange={setPage}
        onAdd={() => {
          setIsModalOpen(true);
        }}
      />
    </FormField>
  );
}

export default PermissionsField;
