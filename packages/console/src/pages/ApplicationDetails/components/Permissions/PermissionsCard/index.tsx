import { type AdminConsoleKey } from '@logto/phrases';
import {
  ApplicationUserConsentScopeType,
  type ApplicationUserConsentScopesResponse,
} from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import FormCard, { type Props as FormCardProps } from '@/components/FormCard';
import TemplateTable from '@/components/TemplateTable';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';

import { type PermissionsPhraseGroup } from '../types';

import ApplicationScopesAssignmentModal from './ApplicationScopesAssignmentModal';
import { ScopeLevel } from './ApplicationScopesAssignmentModal/type';
import ApplicationScopesManagementModal, {
  type EditableScopeData,
} from './ApplicationScopesManagementModal';
import styles from './index.module.scss';
import useScopesTable from './use-scopes-table';

type Props = {
  /** The user consent scopes API path, without a trailing slash. */
  readonly scopesEndpoint: string;
  readonly scopeLevel: ScopeLevel;
  readonly phraseGroup: PermissionsPhraseGroup;
  readonly learnMoreLink?: FormCardProps['learnMoreLink'];
};

function PermissionsCard({ scopesEndpoint, scopeLevel, phraseGroup, learnMoreLink }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data, error, mutate, isLoading } = useSWR<
    ApplicationUserConsentScopesResponse,
    RequestError
  >(scopesEndpoint);

  const { parseRowGroup, deleteScope, editScope } = useScopesTable();

  const [editScopeModalData, setEditScopeModalData] = useState<EditableScopeData>();
  const [isAssignScopesModalOpen, setIsAssignScopesModalOpen] = useState(false);

  const rowGroups = useMemo(() => {
    const { userLevelRowGroups, organizationLevelGroups } = parseRowGroup(data);

    return scopeLevel === ScopeLevel.User ? userLevelRowGroups : organizationLevelGroups;
  }, [data, parseRowGroup, scopeLevel]);

  const displayTextProps = useMemo<{
    formCard: Omit<FormCardProps, 'children'>;
    tableName: AdminConsoleKey;
  }>(() => {
    const scopeLevelPhrase = scopeLevel === ScopeLevel.User ? 'user' : 'organization';

    return {
      formCard: {
        title: `${phraseGroup}.${scopeLevelPhrase}_title`,
        description: `${phraseGroup}.${scopeLevelPhrase}_description`,
        learnMoreLink,
      },
      tableName: `${phraseGroup}.grant_${scopeLevelPhrase}_level_permissions`,
    };
  }, [learnMoreLink, phraseGroup, scopeLevel]);

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
            colSpan: 1,
            render: (data) => (
              <ActionsButton
                fieldName="application_details.permissions.name"
                deleteConfirmation={`${phraseGroup}.permission_delete_confirm`}
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
                  await deleteScope(data, scopesEndpoint);
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
          scopesEndpoint={scopesEndpoint}
          scopeLevel={scopeLevel}
          phraseGroup={phraseGroup}
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
