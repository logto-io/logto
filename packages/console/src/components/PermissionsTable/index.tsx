import type { AdminConsoleKey } from '@logto/phrases';
import type { ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Plus from '@/assets/icons/plus.svg';
import PermissionsEmptyDark from '@/assets/images/permissions-empty-dark.svg';
import PermissionsEmpty from '@/assets/images/permissions-empty.svg';
import { ApiResourceDetailsTabs } from '@/consts/page-tabs';
import Button from '@/ds-components/Button';
import type { Props as PaginationProps } from '@/ds-components/Pagination';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import type { Column } from '@/ds-components/Table/types';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import ActionsButton from '../ActionsButton';
import EditScopeModal, { type EditScopeData } from '../EditScopeModal';
import EmptyDataPlaceholder from '../EmptyDataPlaceholder';

import EditPermissionModal from './EditPermissionModal';
import * as styles from './index.module.scss';

type SearchProps = {
  keyword: string;
  searchHandler: (value: string) => void;
  clearSearchHandler: () => void;
};

type Props = {
  /** List of permissions to be displayed in the table. */
  readonly scopes?: ScopeResponse[];
  /** Whether the table is loading data or not. */
  readonly isLoading: boolean;
  /** Error message to be displayed when the table fails to load data. */
  readonly errorMessage?: string;
  /** The translation key of the create button. */
  readonly createButtonTitle: AdminConsoleKey;
  /** Whether the table is read-only or not.
   *  If true, the table will not display the create button and action buttons (editing & deletion).
   */
  readonly isReadOnly?: boolean;
  /** Whether the API column is visible or not.
   * The API column displays the API resource that the permission belongs to.
   */
  readonly isApiColumnVisible?: boolean;
  /** Whether the create guide is visible or not.
   * If true, the table will display a placeholder guiding the user to create a new permission if no permissions are found.
   */
  readonly isCreateGuideVisible?: boolean;
  /** Pagination related props, used to navigate through the permissions in the table. */
  readonly pagination?: PaginationProps;
  /** Search related props, used to filter the permissions in the table. */
  readonly search: SearchProps;
  /** Function that will be called when the create button is clicked. */
  readonly createHandler: () => void;
  /** Callback function that will be called when a permission is going to be deleted. */
  readonly deleteHandler: (scope: ScopeResponse) => void;
  /** Function that will be called when the retry button is click. */
  readonly retryHandler: () => void;
  /** Callback function that will be called when the permission is updated (edited). */
  readonly onPermissionUpdated: () => void;
  /** Specify deletion related text */
  readonly deletionText: {
    /** Delete button title in the action list */
    actionButton: AdminConsoleKey;
    /** Confirmation content in the deletion confirmation modal */
    confirmation: AdminConsoleKey;
    /** Confirmation button title in the deletion confirmation modal */
    confirmButton: AdminConsoleKey;
  };
};

function PermissionsTable({
  scopes,
  isLoading,
  errorMessage,
  createButtonTitle,
  isReadOnly = false,
  isApiColumnVisible = false,
  isCreateGuideVisible = false,
  pagination,
  search: { keyword, searchHandler, clearSearchHandler },
  createHandler,
  deleteHandler,
  retryHandler,
  onPermissionUpdated,
  deletionText,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const [editingScope, setEditingScope] = useState<ScopeResponse>();

  const api = useApi();

  const handleEdit = async (scope: ScopeResponse, editedData: EditScopeData) => {
    const patchApiEndpoint = `api/resources/${scope.resourceId}/scopes/${scope.id}`;
    await api.patch(patchApiEndpoint, { json: editedData });
    toast.success(t('general.saved'));
    onPermissionUpdated();
  };

  const nameColumn: Column<ScopeResponse> = {
    title: t('permissions.name_column'),
    dataIndex: 'name',
    colSpan: isApiColumnVisible ? 5 : 6,
    render: ({ name }) => <Tag variant="cell">{name}</Tag>,
  };

  const descriptionColumn: Column<ScopeResponse> = {
    title: t('permissions.description_column'),
    dataIndex: 'description',
    colSpan: isApiColumnVisible ? 5 : 9,
    render: ({ description }) => <div className={styles.description}>{description}</div>,
  };

  const apiColumn: Column<ScopeResponse> = {
    title: t('permissions.api_column'),
    dataIndex: 'resource',
    colSpan: 5,
    render: ({ resource }) => (
      <TextLink
        className={styles.link}
        to={`/api-resources/${resource.id}/${ApiResourceDetailsTabs.General}`}
      >
        {resource.name}
      </TextLink>
    ),
  };

  const actionColumn: Column<ScopeResponse> = {
    title: null,
    dataIndex: 'action',
    colSpan: 1,
    className: styles.actionColumn,
    render: (scope) =>
      /**
       * When the table is read-only, hide the delete button rather than the whole column to keep the table column spaces.
       */
      isReadOnly ? null : (
        <ActionsButton
          fieldName="permissions.name_column"
          deleteConfirmation={deletionText.confirmation}
          textOverrides={{
            edit: 'permissions.edit',
            delete: deletionText.actionButton,
            deleteConfirmation: deletionText.confirmButton,
          }}
          onDelete={() => {
            deleteHandler(scope);
          }}
          onEdit={() => {
            setEditingScope(scope);
          }}
        />
      ),
  };

  const columns = [
    nameColumn,
    descriptionColumn,
    conditional(isApiColumnVisible && apiColumn),
    actionColumn,
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  ].filter((column): column is Column<ScopeResponse> => Boolean(column));

  return (
    <>
      <Table
        className={styles.permissionTable}
        rowIndexKey="id"
        rowGroups={[{ key: 'scopes', data: scopes }]}
        columns={columns}
        filter={
          <div className={styles.filter}>
            <Search
              defaultValue={keyword}
              isClearable={Boolean(keyword)}
              placeholder={t(
                isApiColumnVisible
                  ? 'permissions.search_placeholder'
                  : 'permissions.search_placeholder_without_api'
              )}
              onSearch={searchHandler}
              onClearSearch={clearSearchHandler}
            />
            {!isReadOnly && (
              <Button
                title={createButtonTitle}
                className={styles.createButton}
                type="primary"
                size="large"
                icon={<Plus />}
                onClick={() => {
                  createHandler();
                }}
              />
            )}
          </div>
        }
        isLoading={isLoading}
        pagination={pagination}
        placeholder={
          !isReadOnly && isCreateGuideVisible ? (
            <TablePlaceholder
              image={<PermissionsEmpty />}
              imageDark={<PermissionsEmptyDark />}
              title="permissions.placeholder_title"
              description="permissions.placeholder_description"
              learnMoreLink={{
                href: getDocumentationUrl('/docs/recipes/rbac/manage-permissions-and-roles'),
                targetBlank: 'noopener',
              }}
              action={
                <Button
                  title={createButtonTitle}
                  type="primary"
                  size="large"
                  icon={<Plus />}
                  onClick={() => {
                    createHandler();
                  }}
                />
              }
            />
          ) : (
            <EmptyDataPlaceholder />
          )
        }
        errorMessage={errorMessage}
        onRetry={retryHandler}
      />
      {editingScope && (
        <EditScopeModal
          scopeName={editingScope.name}
          data={editingScope}
          text={{
            title: 'permissions.edit_title',
            nameField: 'api_resource_details.permission.name',
            descriptionField: 'api_resource_details.permission.description',
            descriptionPlaceholder: 'api_resource_details.permission.description_placeholder',
          }}
          onSubmit={async (editedData) => {
            await handleEdit(editingScope, editedData);
          }}
          onClose={() => {
            setEditingScope(undefined);
          }}
        />
      )}
    </>
  );
}

export default PermissionsTable;
