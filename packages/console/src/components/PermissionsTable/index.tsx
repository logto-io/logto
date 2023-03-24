import type { AdminConsoleKey } from '@logto/phrases';
import type { ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/images/delete.svg';
import PermissionsEmptyDark from '@/assets/images/permissions-empty-dark.svg';
import PermissionsEmpty from '@/assets/images/permissions-empty.svg';
import Plus from '@/assets/images/plus.svg';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import Search from '@/components/Search';
import Table from '@/components/Table';
import type { Column } from '@/components/Table/types';
import TextLink from '@/components/TextLink';
import { Tooltip } from '@/components/Tip';
import { ApiResourceDetailsTabs } from '@/consts/page-tabs';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import * as styles from './index.module.scss';
import EmptyDataPlaceholder from '../EmptyDataPlaceholder';
import type { Props as PaginationProps } from '../Pagination';
import TablePlaceholder from '../Table/TablePlaceholder';

type SearchProps = {
  keyword: string;
  searchHandler: (value: string) => void;
  clearSearchHandler: () => void;
};

type Props = {
  scopes?: ScopeResponse[];
  isLoading: boolean;
  errorMessage?: string;
  createButtonTitle: AdminConsoleKey;
  deleteButtonTitle?: AdminConsoleKey;
  isReadOnly?: boolean;
  isApiColumnVisible?: boolean;
  isCreateGuideVisible?: boolean;
  pagination?: PaginationProps;
  search: SearchProps;
  createHandler: () => void;
  deleteHandler: (ScopeResponse: ScopeResponse) => void;
  retryHandler: () => void;
};

function PermissionsTable({
  scopes,
  isLoading,
  errorMessage,
  createButtonTitle,
  deleteButtonTitle = 'general.delete',
  isReadOnly = false,
  isApiColumnVisible = false,
  isCreateGuideVisible = false,
  pagination,
  search: { keyword, searchHandler, clearSearchHandler },
  createHandler,
  deleteHandler,
  retryHandler,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const nameColumn: Column<ScopeResponse> = {
    title: t('permissions.name_column'),
    dataIndex: 'name',
    colSpan: isApiColumnVisible ? 5 : 6,
    render: ({ name }) => <div className={styles.name}>{name}</div>,
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
        to={`/api-resources/${resource.id}/${ApiResourceDetailsTabs.Settings}`}
      >
        {resource.name}
      </TextLink>
    ),
  };

  const deleteColumn: Column<ScopeResponse> = {
    title: null,
    dataIndex: 'delete',
    colSpan: 1,
    render: (scope) =>
      /**
       * When the table is read-only, hide the delete button rather than the whole column to keep the table column spaces.
       */
      isReadOnly ? null : (
        <Tooltip content={<div>{t(deleteButtonTitle)}</div>}>
          <IconButton
            onClick={() => {
              deleteHandler(scope);
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      ),
  };

  const columns = [
    nameColumn,
    descriptionColumn,
    conditional(isApiColumnVisible && apiColumn),
    deleteColumn,
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  ].filter((column): column is Column<ScopeResponse> => Boolean(column));

  return (
    <Table
      className={styles.permissionTable}
      rowIndexKey="id"
      rowGroups={[{ key: 'scopes', data: scopes }]}
      columns={columns}
      filter={
        <div className={styles.filter}>
          <Search
            inputClassName={styles.searchInput}
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
            learnMoreLink={getDocumentationUrl('/docs/recipes/rbac/manage-permissions-and-roles')}
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
  );
}

export default PermissionsTable;
