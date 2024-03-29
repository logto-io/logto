import { type OrganizationScope } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import PermissionsEmptyDark from '@/assets/images/permissions-empty-dark.svg';
import PermissionsEmpty from '@/assets/images/permissions-empty.svg';
import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { organizationPermissionLink } from '@/consts';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag from '@/ds-components/Tag';
import { type RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import * as styles from './index.module.scss';

function OrgPermissions() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const [{ keyword }, updateSearchParameters] = useSearchParametersWatcher({
    keyword: '',
  });

  const { data, error, mutate, isLoading } = useSWR<OrganizationScope[], RequestError>(
    buildUrl('api/organization-scopes', {
      ...cond(keyword && { q: formatSearchKeyword(keyword) }),
    })
  );

  return (
    <Table
      rowGroups={[{ key: 'orgPermissions', data }]}
      rowIndexKey="id"
      columns={[
        {
          title: <DynamicT forKey="organization_template.org_permissions.permission_column" />,
          dataIndex: 'name',
          colSpan: 7,
          render: ({ name }) => {
            return (
              <Tag variant="cell">
                <Breakable>{name}</Breakable>
              </Tag>
            );
          },
        },
        {
          title: <DynamicT forKey="organization_template.org_permissions.description_column" />,
          dataIndex: 'scopes',
          colSpan: 8,
          render: ({ description }) => <Breakable>{description ?? '-'}</Breakable>,
        },
        {
          title: null,
          dataIndex: 'action',
          colSpan: 1,
          render: () => (
            <ActionsButton
              fieldName="organization_template.org_permissions.permission_column"
              deleteConfirmation="organization_template.org_permissions.delete_confirm"
              onEdit={() => {
                // Todo @xiaoyijun implement edit
              }}
              onDelete={async () => {
                // Todo @xiaoyijun implement deletion
              }}
            />
          ),
        },
      ]}
      filter={
        <div className={styles.filter}>
          <Search
            placeholder={t('organization_template.org_permissions.search_placeholder')}
            defaultValue={keyword}
            isClearable={Boolean(keyword)}
            onSearch={(keyword) => {
              updateSearchParameters({ keyword });
            }}
            onClearSearch={() => {
              updateSearchParameters({ keyword: '' });
            }}
          />
          <Button
            title="organization_template.org_permissions.create_org_permission"
            className={styles.createButton}
            type="primary"
            size="large"
            icon={<Plus />}
            onClick={() => {
              // Todo @xiaoyijun implement org permission creation
            }}
          />
        </div>
      }
      placeholder={
        keyword ? (
          <EmptyDataPlaceholder />
        ) : (
          <TablePlaceholder
            image={<PermissionsEmpty />}
            imageDark={<PermissionsEmptyDark />}
            title="organization_template.org_permissions.placeholder_title"
            description="organization_template.org_permissions.placeholder_description"
            learnMoreLink={{
              href: getDocumentationUrl(organizationPermissionLink),
              targetBlank: 'noopener',
            }}
            action={
              <Button
                title="organization_template.org_permissions.create_org_permission"
                type="primary"
                size="large"
                icon={<Plus />}
                onClick={() => {
                  // Todo @xiaoyijun implement org permission creation
                }}
              />
            }
          />
        )
      }
      isLoading={isLoading}
      errorMessage={error?.body?.message ?? error?.message}
      onRetry={async () => mutate(undefined, true)}
    />
  );
}

export default OrgPermissions;
