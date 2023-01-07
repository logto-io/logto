import type { ScopeResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Delete from '@/assets/images/delete.svg';
import type { RequestError } from '@/hooks/use-api';

import IconButton from '../IconButton';
import Search from '../Search';
import Table from '../Table';
import type { Column } from '../Table/types';
import TextLink from '../TextLink';
import * as styles from './index.module.scss';

type Props = {
  fetchUrl: string;
  createButton: ReactNode;
  deleteHandler: (ScopeResponse: ScopeResponse) => void;
  placeholderContent: ReactNode;
  isApiColumnDisplayed?: boolean;
};

const PermissionsTable = ({
  fetchUrl,
  createButton,
  deleteHandler,
  placeholderContent,
  isApiColumnDisplayed = false,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { data: ScopeResponses, error, mutate } = useSWR<ScopeResponse[], RequestError>(fetchUrl);

  const isLoading = !ScopeResponses && !error;

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
        <TextLink to={`/api-resources/${resource.id}`} target="_blank">
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
      rowGroups={[{ key: 'ScopeResponses', data: ScopeResponses }]}
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
      errorMessage={error?.body?.message ?? error?.message}
      onRetry={async () => mutate(undefined, true)}
    />
  );
};

export default PermissionsTable;
