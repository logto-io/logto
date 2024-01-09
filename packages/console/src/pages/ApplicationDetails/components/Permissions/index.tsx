import { type Application, type ApplicationUserConsentScopesResponse } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import FormCard from '@/components/FormCard';
import TemplateTable from '@/components/TemplateTable';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';

import usePermissionsTable from './use-permissions-table';

type Props = {
  application: Application;
};

function Permissions({ application }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [isAssignScopesModalOpen, setIsAssignScopesModalOpen] = useState(false);
  const { parseRowGroup, deletePermission } = usePermissionsTable();

  const { data, error, mutate } = useSWR<ApplicationUserConsentScopesResponse, RequestError>(
    `api/applications/${application.id}/user-consent-scopes`
  );

  const isLoading = !data && !error;
  const rowGroups = useMemo(() => parseRowGroup(data), [data, parseRowGroup]);

  return (
    <FormCard
      title="application_details.permissions.name"
      description="application_details.permissions.description"
    >
      <TemplateTable
        name="application_details.permissions.table_name"
        rowIndexKey="id"
        isLoading={isLoading}
        rowGroups={rowGroups}
        columns={[
          {
            title: t('general.name'),
            dataIndex: 'name',
            colSpan: 5,
            render: ({ name }) => (
              <Tag variant="cell">
                <Breakable>{name}</Breakable>
              </Tag>
            ),
          },
          {
            title: t('general.description'),
            dataIndex: 'description',
            colSpan: 5,
            render: ({ description }) => <Breakable>{description ?? '-'}</Breakable>,
          },
          {
            title: null,
            dataIndex: 'delete',
            render: (data) => (
              <ActionsButton
                fieldName="application_details.permissions.name"
                deleteConfirmation="application_details.permissions.permission_delete_confirm"
                textOverrides={{
                  delete: 'application_details.permissions.delete_text',
                  deleteConfirmation: 'general.remove',
                }}
                onEdit={() => {
                  // TODO: Implement edit permission
                }}
                onDelete={async () => {
                  await deletePermission(data, application.id);
                  void mutate();
                }}
              />
            ),
          },
        ]}
        onAdd={() => {
          setIsAssignScopesModalOpen(true);
        }}
      />
    </FormCard>
  );
}

export default Permissions;
