import type { ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Delete from '@/assets/images/delete.svg';
import { ApiResourceDetailsTabs } from '@/consts/page-tabs';

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
  createButton: ReactNode;
  isApiColumnDisplayed?: boolean;
  placeholderContent: ReactNode;
  deleteHandler: (ScopeResponse: ScopeResponse) => void;
  retryHandler: () => void;
};

const PermissionsTable = ({
  scopes,
  isLoading,
  errorMessage,
  createButton,
  isApiColumnDisplayed = false,
  placeholderContent,
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
    render: ({ description }) => <div className={styles.description}>{description}</div>,
  };

  const apiColumn: Column<ScopeResponse> = {
    title: t('permissions.api_column'),
    dataIndex: 'resource',
    colSpan: 5,
    render: ({ resource }) => (
      <div className={styles.api}>
        <TextLink
          to={`/api-resources/${resource.id}/${ApiResourceDetailsTabs.Settings}`}
          target="_blank"
        >
          {resource.name}
        </TextLink>
      </div>
    ),
  };

  const deleteColumn: Column<ScopeResponse> = {
    title: null,
    dataIndex: 'delete',
    colSpan: 1,
    render: (ScopeResponse) => (
      <IconButton
        onClick={() => {
          deleteHandler(ScopeResponse);
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
      rowGroups={[{ key: 'ScopeResponses', data: scopes }]}
      columns={columns}
      filter={
        <div className={styles.filter}>
          <Search />
          {createButton}
        </div>
      }
      isLoading={isLoading}
      placeholder={{
        content: placeholderContent,
      }}
      errorMessage={errorMessage}
      onRetry={retryHandler}
    />
  );
};

export default PermissionsTable;
