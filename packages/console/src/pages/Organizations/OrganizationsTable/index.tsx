import { type Organization } from '@logto/schemas';
import { joinPath } from '@silverhand/essentials';
import { useState } from 'react';
import useSWR from 'swr';

import OrganizationIcon from '@/assets/icons/organization-preview.svg';
import ItemPreview from '@/components/ItemPreview';
import ThemedIcon from '@/components/ThemedIcon';
import { defaultPageSize } from '@/consts';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import Table from '@/ds-components/Table';
import { type RequestError } from '@/hooks/use-api';
import { buildUrl } from '@/utils/url';

const pageSize = defaultPageSize;
const pathname = '/organizations';
const apiPathname = 'api/organizations';

function OrganizationsTable() {
  const [page, setPage] = useState(1);
  const { data: response, error } = useSWR<[Organization[], number], RequestError>(
    buildUrl(apiPathname, {
      page: String(page),
      page_size: String(pageSize),
    })
  );
  const isLoading = !response && !error;
  const [data, totalCount] = response ?? [[], 0];

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Add loading skeleton
  }

  return (
    <Table
      rowGroups={[{ key: 'data', data }]}
      columns={[
        {
          title: 'Name',
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
          title: 'Organization ID',
          dataIndex: 'id',
          render: ({ id }) => <CopyToClipboard value={id} variant="text" />,
        },
        {
          title: 'Members',
          dataIndex: 'members',
          render: () => 'members',
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
