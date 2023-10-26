import { type OrganizationWithFeatured, RoleType } from '@logto/schemas';
import { joinPath } from '@silverhand/essentials';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import OrganizationIcon from '@/assets/icons/organization-preview.svg';
import ItemPreview from '@/components/ItemPreview';
import ThemedIcon from '@/components/ThemedIcon';
import { defaultPageSize } from '@/consts';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import Table from '@/ds-components/Table';
import { type RequestError } from '@/hooks/use-api';
import AssignedEntities from '@/pages/Roles/components/AssignedEntities';
import { buildUrl } from '@/utils/url';

const pageSize = defaultPageSize;
const pathname = '/organizations';
const apiPathname = 'api/organizations';

function OrganizationsTable() {
  const [page, setPage] = useState(1);
  const { data: response, error } = useSWR<[OrganizationWithFeatured[], number], RequestError>(
    buildUrl(apiPathname, {
      showFeatured: '1',
      page: String(page),
      page_size: String(pageSize),
    })
  );
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isLoading = !response && !error;
  const [data, totalCount] = response ?? [[], 0];

  return (
    <Table
      isLoading={isLoading}
      rowGroups={[{ key: 'data', data }]}
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
    />
  );
}

export default OrganizationsTable;
