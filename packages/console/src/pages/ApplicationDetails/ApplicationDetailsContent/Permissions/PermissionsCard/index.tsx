import { type AdminConsoleKey } from '@logto/phrases';
import {
  ApplicationUserConsentScopeType,
  type ApplicationUserConsentScopesResponse,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import FormCard, { type Props as FormCardProps } from '@/components/FormCard';
import TemplateTable from '@/components/TemplateTable';
import { logtoThirdPartyAppPermissionsLink } from '@/consts';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import ApplicationScopesAssignmentModal from './ApplicationScopesAssignmentModal';
import { ScopeLevel } from './ApplicationScopesAssignmentModal/type';
import ApplicationScopesManagementModal, {
  type EditableScopeData,
} from './ApplicationScopesManagementModal';
import * as styles from './index.module.scss';
import useScopesTable from './use-scopes-table';

type Props = {
  readonly applicationId: string;
  readonly scopeLevel: ScopeLevel;
};

function PermissionsCard({ applicationId, scopeLevel }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const { data, error, mutate, isLoading } = useSWR<
    ApplicationUserConsentScopesResponse,
    RequestError
  >(`api/applications/${applicationId}/user-consent-scopes`);

  const { parseRowGroup, deleteScope, editScope } = useScopesTable();

  const [editScopeModalData, setEditScopeModalData] = useState<EditableScopeData>();
  const [isAssignScopesModalOpen, setIsAssignScopesModalOpen] = useState(false);

  const rowGroups = useMemo(() => {
    const { userLevelRowGroups, organizationLevelGroups } = parseRowGroup(data);

    if (scopeLevel === ScopeLevel.All) {
      return [...userLevelRowGroups, ...organizationLevelGroups];
    }

    return scopeLevel === ScopeLevel.User ? userLevelRowGroups : organizationLevelGroups;
  }, [data, parseRowGroup, scopeLevel]);

  const displayTextProps = useMemo<{
    formCard: Omit<FormCardProps, 'children'>;
    tableName: AdminConsoleKey;
  }>(() => {
    if (scopeLevel === ScopeLevel.All) {
      return {
        formCard: {
          title: 'application_details.permissions.name',
          description: 'application_details.permissions.description',
          learnMoreLink: {
            href: getDocumentationUrl(logtoThirdPartyAppPermissionsLink),
            targetBlank: 'noopener',
          },
        },
        tableName: 'application_details.permissions.table_name',
      };
    }

    const scopeLevelPhrase = scopeLevel === ScopeLevel.User ? 'user' : 'organization';

    return {
      formCard: {
        title: `application_details.permissions.${scopeLevelPhrase}_title`,
        description: `application_details.permissions.${scopeLevelPhrase}_description`,
        learnMoreLink: conditional(
          scopeLevel === ScopeLevel.User && {
            href: getDocumentationUrl(logtoThirdPartyAppPermissionsLink),
            targetBlank: 'noopener',
          }
        ),
      },
      tableName: `application_details.permissions.grant_${scopeLevelPhrase}_level_permissions`,
    };
  }, [getDocumentationUrl, scopeLevel]);

  return (
    <FormCard {...displayTextProps.formCard}>
      <TemplateTable
        className={styles.permissionsModal}
        name={displayTextProps.tableName}
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
                  await deleteScope(data, applicationId);
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
      {/* Render the permissions assignment modal only if the data is fetched properly */}
      {data && (
        <ApplicationScopesAssignmentModal
          isOpen={isAssignScopesModalOpen}
          applicationId={applicationId}
          scopeLevel={scopeLevel}
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
    </FormCard>
  );
}

export default PermissionsCard;
