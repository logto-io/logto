import type { Resource } from '@logto/schemas';
import { isManagementApi, Theme } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import ApiResourceDark from '@/assets/icons/api-resource-dark.svg?react';
import ApiResource from '@/assets/icons/api-resource.svg?react';
import ManagementApiResourceDark from '@/assets/icons/management-api-resource-dark.svg?react';
import ManagementApiResource from '@/assets/icons/management-api-resource.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import PageMeta from '@/components/PageMeta';
import { defaultPageSize, apiResources as apiResourcesDocumentationLink } from '@/consts';
import { ApiResourceDetailsTabs } from '@/consts/page-tabs';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import type { RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useTheme from '@/hooks/use-theme';
import pageLayout from '@/scss/page-layout.module.scss';
import { buildUrl } from '@/utils/url';

import CreateForm from './components/CreateForm';
import styles from './index.module.scss';

const pageSize = defaultPageSize;
const apiResourcesPathname = '/api-resources';
const createApiResourcePathname = `${apiResourcesPathname}/create`;
const buildDetailsPathname = (id: string) =>
  `${apiResourcesPathname}/${id}/${ApiResourceDetailsTabs.Permissions}`;

const icons = {
  [Theme.Light]: { ApiIcon: ApiResource, ManagementApiIcon: ManagementApiResource },
  [Theme.Dark]: { ApiIcon: ApiResourceDark, ManagementApiIcon: ManagementApiResourceDark },
};

function ApiResources() {
  const { search } = useLocation();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [{ page }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
  });

  const url = buildUrl('api/resources', {
    page: String(page),
    page_size: String(pageSize),
  });

  const { data, error, mutate } = useSWR<[Resource[], number], RequestError>(url);

  const isLoading = !data && !error;
  const { navigate, match } = useTenantPathname();
  const theme = useTheme();
  const [apiResources, totalCount] = data ?? [];

  const { ApiIcon, ManagementApiIcon } = icons[theme];
  const isCreating = match(createApiResourcePathname);

  return (
    <div className={pageLayout.container}>
      <PageMeta titleKey="api_resources.page_title" />
      <div className={pageLayout.headline}>
        <CardTitle
          title="api_resources.title"
          subtitle="api_resources.subtitle"
          learnMoreLink={{ href: apiResourcesDocumentationLink }}
        />
        <Button
          icon={<Plus />}
          type="primary"
          size="large"
          title="api_resources.create"
          onClick={() => {
            navigate({
              pathname: createApiResourcePathname,
              search,
            });
          }}
        />
      </div>
      <Table
        className={pageLayout.table}
        rowGroups={[{ key: 'apiResources', data: apiResources }]}
        rowIndexKey="id"
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        columns={[
          {
            title: t('api_resources.api_name'),
            dataIndex: 'name',
            colSpan: 6,
            render: ({ id, name, isDefault, indicator }) => {
              const Icon = isManagementApi(indicator) ? ManagementApiIcon : ApiIcon;
              return (
                <ItemPreview
                  title={name}
                  icon={<Icon className={styles.icon} />}
                  to={buildDetailsPathname(id)}
                  suffix={isDefault && <Tag>{t('api_resources.default_api')}</Tag>}
                />
              );
            },
          },
          {
            title: t('api_resources.api_identifier'),
            dataIndex: 'indicator',
            colSpan: 10,
            render: ({ indicator }) => <CopyToClipboard value={indicator} variant="text" />,
          },
        ]}
        placeholder={<EmptyDataPlaceholder />}
        rowClickHandler={({ id }) => {
          navigate(buildDetailsPathname(id));
        }}
        pagination={{
          page,
          totalCount,
          pageSize,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        }}
        onRetry={async () => mutate(undefined, true)}
      />
      {isCreating && (
        <CreateForm
          onClose={(newApiResource) => {
            if (newApiResource) {
              navigate(`/api-resources/${newApiResource.id}`);
              return;
            }
            navigate({
              pathname: apiResourcesPathname,
              search,
            });
          }}
        />
      )}
    </div>
  );
}

export default ApiResources;
