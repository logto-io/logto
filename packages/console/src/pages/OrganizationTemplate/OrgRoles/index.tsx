import { type OrganizationRoleWithScopes } from '@logto/schemas';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import OrgRoleIcon from '@/assets/icons/role-feature.svg';
import RolesEmptyDark from '@/assets/images/roles-empty-dark.svg';
import RolesEmpty from '@/assets/images/roles-empty.svg';
import Breakable from '@/components/Breakable';
import ItemPreview from '@/components/ItemPreview';
import ThemedIcon from '@/components/ThemedIcon';
import { defaultPageSize, organizationRoleLink } from '@/consts';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import { buildUrl } from '@/utils/url';

import * as styles from './index.module.scss';

function OrgRoles() {
  const { getDocumentationUrl } = useDocumentationUrl();

  const [{ page }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
  });

  const { data, error, mutate, isLoading } = useSWR<
    [OrganizationRoleWithScopes[], number],
    RequestError
  >(
    buildUrl('api/organization-roles', {
      page: String(page),
      page_size: String(defaultPageSize),
    })
  );

  const [orgRoles, totalCount] = data ?? [];

  return (
    <Table
      rowGroups={[{ key: 'orgRoles', data: orgRoles }]}
      rowIndexKey="id"
      columns={[
        {
          title: <DynamicT forKey="organization_template.org_roles.org_role_column" />,
          dataIndex: 'name',
          colSpan: 4,
          render: ({ name }) => {
            return <ItemPreview title={name} icon={<ThemedIcon for={OrgRoleIcon} />} />;
          },
        },
        {
          title: <DynamicT forKey="organization_template.org_roles.permissions_column" />,
          dataIndex: 'scopes',
          colSpan: 12,
          render: ({ scopes }) => {
            return scopes.length === 0 ? (
              '-'
            ) : (
              <div className={styles.permissions}>
                {scopes.map(({ id, name }) => (
                  <Tag key={id} variant="cell">
                    <Breakable>{name}</Breakable>
                  </Tag>
                ))}
              </div>
            );
          },
        },
      ]}
      filter={
        <div className={styles.filter}>
          <Button
            title="organization_template.org_roles.create_org_roles"
            type="primary"
            size="large"
            icon={<Plus />}
            onClick={() => {
              // Todo @xiaoyijun implment create org role
            }}
          />
        </div>
      }
      placeholder={
        <TablePlaceholder
          image={<RolesEmpty />}
          imageDark={<RolesEmptyDark />}
          title="organization_template.org_roles.placeholder_title"
          description="organization_template.org_roles.placeholder_description"
          learnMoreLink={{
            href: getDocumentationUrl(organizationRoleLink),
            targetBlank: 'noopener',
          }}
          action={
            <Button
              title="organization_template.org_roles.create_org_roles"
              type="primary"
              size="large"
              icon={<Plus />}
              onClick={() => {
                // Todo @xiaoyijun implment create org role
              }}
            />
          }
        />
      }
      pagination={{
        page,
        totalCount,
        pageSize: defaultPageSize,
        onChange: (page) => {
          updateSearchParameters({ page });
        },
      }}
      isLoading={isLoading}
      errorMessage={error?.body?.message ?? error?.message}
      onRetry={async () => mutate(undefined, true)}
    />
  );
}

export default OrgRoles;
