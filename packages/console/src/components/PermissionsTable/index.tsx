import type { AdminConsoleKey } from '@logto/phrases';
import type { ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/images/delete.svg';
import Plus from '@/assets/images/plus.svg';
import { ApiResourceDetailsTabs } from '@/consts/page-tabs';

import Button from '../Button';
import IconButton from '../IconButton';
import Search from '../Search';
import Table from '../Table';
import type { Column } from '../Table/types';
import TextLink from '../TextLink';
import * as styles from './index.module.scss';

type Props = {
  scopes?: ScopeResponse[];
  isLoading: boolean;
  errorMessage?: string;
  createButtonTitle: AdminConsoleKey;
  isApiColumnDisplayed?: boolean;
  createHandler: () => void;
  deleteHandler: (ScopeResponse: ScopeResponse) => void;
  retryHandler: () => void;
};

const PermissionsTable = ({
  scopes,
  isLoading,
  errorMessage,
  createButtonTitle,
  isApiColumnDisplayed = false,
  createHandler,
  deleteHandler,
  retryHandler,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const nameColumn: Column<ScopeResponse> = {
    title: t('permissions.name_column'),
    dataIndex: 'name',
    colSpan: isApiColumnDisplayed ? 5 : 6,
    render: ({ name }) => <div className={styles.name}>{name}</div>,
  };

  const descriptionColumn: Column<ScopeResponse> = {
    title: t('permissions.description_column'),
    dataIndex: 'description',
    colSpan: isApiColumnDisplayed ? 5 : 9,
    render: ({ description }) => description,
  };

  const apiColumn: Column<ScopeResponse> = {
    title: t('permissions.api_column'),
    dataIndex: 'resource',
    colSpan: 5,
    render: ({ resource }) => (
      <TextLink
        to={`/api-resources/${resource.id}/${ApiResourceDetailsTabs.Settings}`}
        target="_blank"
      >
        {resource.name}
      </TextLink>
    ),
  };

  const deleteColumn: Column<ScopeResponse> = {
    title: null,
    dataIndex: 'delete',
    colSpan: 1,
    render: (scope) => (
      <IconButton
        onClick={() => {
          deleteHandler(scope);
        }}
      >
        <Delete />
      </IconButton>
    ),
  };

  const columns = [
    nameColumn,
    descriptionColumn,
    conditional(isApiColumnDisplayed && apiColumn),
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
          <Search />
          <Button
            title={createButtonTitle}
            type="primary"
            size="large"
            icon={<Plus />}
            onClick={() => {
              createHandler();
            }}
          />
        </div>
      }
      isLoading={isLoading}
      placeholder={{
        content: (
          <Button
            title={createButtonTitle}
            type="outline"
            onClick={() => {
              createHandler();
            }}
          />
        ),
      }}
      errorMessage={errorMessage}
      onRetry={retryHandler}
    />
  );
};

export default PermissionsTable;
