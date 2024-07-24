import { type OrganizationScope } from '@logto/schemas';
import { type Nullable, cond } from '@silverhand/essentials';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg?react';
import PermissionsEmptyDark from '@/assets/images/permissions-empty-dark.svg?react';
import PermissionsEmpty from '@/assets/images/permissions-empty.svg?react';
import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ManageOrganizationPermissionModal from '@/components/ManageOrganizationPermissionModal';
import { organizationPermissionLink } from '@/consts';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import Search from '@/ds-components/Search';
import Table from '@/ds-components/Table';
import TablePlaceholder from '@/ds-components/Table/TablePlaceholder';
import Tag from '@/ds-components/Tag';
import useApi, { type RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import styles from './index.module.scss';

function OrganizationPermissions() {
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

  const api = useApi();

  const [permissionModalData, setPermissionModalData] = useState<Nullable<OrganizationScope>>();

  return (
    <>
      <Table
        rowGroups={[{ key: 'organizationPermissions', data }]}
        rowIndexKey="id"
        columns={[
          {
            title: <DynamicT forKey="organization_template.permissions.permission_column" />,
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
            title: <DynamicT forKey="organization_template.permissions.description_column" />,
            dataIndex: 'scopes',
            colSpan: 8,
            render: ({ description }) => <Breakable>{description ?? '-'}</Breakable>,
          },
          {
            title: null,
            dataIndex: 'action',
            colSpan: 1,
            render: (scope) => (
              <ActionsButton
                fieldName="organization_template.permissions.permission_column"
                deleteConfirmation="organization_template.permissions.delete_confirm"
                onEdit={() => {
                  setPermissionModalData(scope);
                }}
                onDelete={async () => {
                  await api.delete(`api/organization-scopes/${scope.id}`);
                  void mutate();
                }}
              />
            ),
          },
        ]}
        filter={
          <div className={styles.filter}>
            <Search
              placeholder={t('organization_template.permissions.search_placeholder')}
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
              title="organization_template.permissions.create_org_permission"
              className={styles.createButton}
              type="primary"
              icon={<Plus />}
              onClick={() => {
                setPermissionModalData(null);
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
              title="organization_template.permissions.placeholder_title"
              description="organization_template.permissions.placeholder_description"
              learnMoreLink={{
                href: getDocumentationUrl(organizationPermissionLink),
                targetBlank: 'noopener',
              }}
              action={
                <Button
                  title="organization_template.permissions.create_org_permission"
                  type="primary"
                  size="large"
                  icon={<Plus />}
                  onClick={() => {
                    setPermissionModalData(null);
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
      {permissionModalData !== undefined && (
        <ManageOrganizationPermissionModal
          data={permissionModalData}
          onClose={() => {
            setPermissionModalData(undefined);
            void mutate();
          }}
        />
      )}
    </>
  );
}

export default OrganizationPermissions;
