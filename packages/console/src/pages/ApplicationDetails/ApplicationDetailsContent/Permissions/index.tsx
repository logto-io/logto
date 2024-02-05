import {
  type Application,
  type ApplicationUserConsentScopesResponse,
  ApplicationUserConsentScopeType,
} from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import FormCard from '@/components/FormCard';
import TemplateTable from '@/components/TemplateTable';
import { logtoThirdPartyAppPermissionsLink } from '@/consts';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';

import ApplicationScopesAssignmentModal from './ApplicationScopesAssignmentModal';
import ApplicationScopesManagementModal, {
  type EditableScopeData,
} from './ApplicationScopesManagementModal';
import * as styles from './index.module.scss';
import useScopesTable from './use-scopes-table';

type Props = {
  application: Application;
};

function Permissions({ application }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [isAssignScopesModalOpen, setIsAssignScopesModalOpen] = useState(false);
  const [editScopeModalData, setEditScopeModalData] = useState<EditableScopeData>();

  const { parseRowGroup, deleteScope, editScope } = useScopesTable();

  const { data, error, mutate, isLoading } = useSWR<
    ApplicationUserConsentScopesResponse,
    RequestError
  >(`api/applications/${application.id}/user-consent-scopes`);

  const rowGroups = useMemo(() => parseRowGroup(data), [data, parseRowGroup]);

  return (
    <>
      <FormCard
        title="application_details.permissions.name"
        description="application_details.permissions.description"
        learnMoreLink={{
          href: logtoThirdPartyAppPermissionsLink,
          targetBlank: 'noopener',
        }}
      >
        <TemplateTable
          className={styles.permissionsModal}
          name="application_details.permissions.table_name"
          rowIndexKey="id"
          errorMessage={error?.body?.message ?? error?.message}
          isLoading={isLoading}
          rowGroups={rowGroups}
          columns={[
            {
              title: t('application_details.permissions.field_name'),
              dataIndex: 'name',
              colSpan: 5,
              render: ({ name }) => (
                <Tag variant="cell">
                  <Breakable>{name}</Breakable>
                </Tag>
              ),
            },
            {
              title: `${t('general.description')} (${t(
                'application_details.permissions.field_description'
              )})`,
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
                  onEdit={
                    // UserScopes is not editable
                    data.type === ApplicationUserConsentScopeType.UserScopes
                      ? undefined
                      : () => {
                          setEditScopeModalData(data);
                        }
                  }
                  onDelete={async () => {
                    await deleteScope(data, application.id);
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
      {/* Render the permissions assignment modal only if the data is fetched properly */}
      {data && (
        <ApplicationScopesAssignmentModal
          applicationId={application.id}
          isOpen={isAssignScopesModalOpen}
          onClose={() => {
            setIsAssignScopesModalOpen(false);
          }}
        />
      )}
      {data && (
        <ApplicationScopesManagementModal
          scope={editScopeModalData}
          onClose={() => {
            setEditScopeModalData(undefined);
          }}
          onSubmit={async (scope) => {
            await editScope(scope);
            void mutate();
            setEditScopeModalData(undefined);
          }}
        />
      )}
    </>
  );
}

export default Permissions;
