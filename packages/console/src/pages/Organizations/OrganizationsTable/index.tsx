import { type OrganizationWithFeatured, RoleType } from '@logto/schemas';
import { joinPath } from '@silverhand/essentials';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import OrganizationIcon from '@/assets/icons/organization-preview.svg';
import NotFoundDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import ThemedIcon from '@/components/ThemedIcon';
import { defaultPageSize } from '@/consts';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import AssignedEntities from '@/pages/Roles/components/AssignedEntities';
import * as pageLayout from '@/scss/page-layout.module.scss';
import { buildUrl } from '@/utils/url';

import EmptyDataPlaceholder from './EmptyDataPlaceholder';

/** The page size of the organizations table. */
const pageSize = defaultPageSize;
/** The organizations page root pathname. */
const pathname = '/organizations';
/** The organizations API pathname in the management API. */
const apiPathname = 'api/organizations';

type Props = {
  readonly onCreate: () => void;
};

function OrganizationsTable({ onCreate }: Props) {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const { data: response, error } = useSWR<[OrganizationWithFeatured[], number], RequestError>(
    buildUrl(apiPathname, {
      q: keyword,
      showFeatured: '1',
      page: String(page),
      page_size: String(pageSize),
    })
  );
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isTableLoading = !response && !error;
  const [data, totalCount] = response ?? [[], 0];
  const { navigate } = useTenantPathname();

  return (
    <Table
      className={pageLayout.table}
      isLoading={isTableLoading}
      placeholder={
        keyword ? (
          <NotFoundDataPlaceholder />
        ) : (
          <EmptyDataPlaceholder
            buttonProps={{ title: 'organizations.create_organization', onClick: onCreate }}
          />
        )
      }
      rowGroups={[{ key: 'data', data }]}
      rowClickHandler={({ id }) => {
        navigate(joinPath(pathname, id));
      }}
      columns={[
        {
          title: t('general.name'),
          dataIndex: 'name',
          render: ({ name, id }) => (
            <ItemPreview
              title={name}
              icon={<ThemedIcon for={OrganizationIcon} />}
              to={joinPath(pathname, id)}
            />
          ),
        },
        {
          title: t('organizations.organization_id'),
          dataIndex: 'id',
          render: ({ id }) => <CopyToClipboard value={id} variant="text" />,
        },
        {
          title: t('organizations.members'),
          dataIndex: 'members',
          render: ({ usersCount, featuredUsers }) => (
            <AssignedEntities
              type={RoleType.User}
              entities={featuredUsers ?? []}
              count={usersCount ?? 0}
            />
          ),
        },
      ]}
      rowIndexKey="id"
      pagination={{
        page,
        totalCount,
        pageSize,
        onChange: setPage,
      }}
      filter={
        <Search
          defaultValue={keyword}
          isClearable={Boolean(keyword)}
          placeholder={t('organizations.search_placeholder')}
          onSearch={(value) => {
            setKeyword(value);
            setPage(1);
          }}
          onClearSearch={() => {
            setKeyword('');
            setPage(1);
          }}
        />
      }
    />
  );
}

export default OrganizationsTable;
