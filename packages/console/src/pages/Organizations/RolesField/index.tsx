import { type OrganizationRoleWithScopes } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ActionsButton from '@/components/ActionsButton';
import FormField from '@/ds-components/FormField';
import Tag from '@/ds-components/Tag';
import useApi, { type RequestError } from '@/hooks/use-api';
import { buildUrl } from '@/utils/url';

import RoleModal from '../RoleModal';
import TemplateTable, { pageSize } from '../TemplateTable';

import * as styles from './index.module.scss';

/**
 * Renders the roles field that allows users to add, edit, and delete organization
 * roles.
 */
function RolesField() {
  const [page, setPage] = useState(1);
  const {
    data: response,
    error,
    mutate,
  } = useSWR<[OrganizationRoleWithScopes[], number], RequestError>(
    buildUrl('api/organization-roles', {
      page: String(page),
      page_size: String(pageSize),
    })
  );

  const [data, totalCount] = response ?? [[], 0];
  const api = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [editData, setEditData] = useState<Nullable<OrganizationRoleWithScopes>>(null);

  const isLoading = !response && !error;

  return (
    <FormField title="organizations.organization_role_other">
      <RoleModal
        isOpen={isModalOpen}
        editData={editData}
        onClose={() => {
          setIsModalOpen(false);
          void mutate();
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
            render: ({ name }) => <div>{name}</div>,
          },
          {
            title: t('organizations.permission_other'),
            dataIndex: 'permissions',
            colSpan: 6,
            render: ({ scopes }) =>
              scopes.length === 0 ? (
                '-'
              ) : (
                <div className={styles.permissions}>
                  {scopes.map(({ id, name }) => (
                    <Tag key={id} variant="cell">
                      {name}
                    </Tag>
                  ))}
                </div>
              ),
          },
          {
            title: null,
            dataIndex: 'delete',
            render: (data) => (
              <ActionsButton
                fieldName="organizations.role"
                deleteConfirmation="organizations.organization_role_delete_confirm"
                onEdit={() => {
                  setEditData(data);
                  setIsModalOpen(true);
                }}
                onDelete={async () => {
                  await api.delete(`api/organization-roles/${data.id}`);
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

export default RolesField;
