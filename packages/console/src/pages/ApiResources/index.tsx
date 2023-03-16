import type { Resource } from '@logto/schemas';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useLocation, useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import ApiResourceDark from '@/assets/images/api-resource-dark.svg';
import ApiResource from '@/assets/images/api-resource.svg';
import Plus from '@/assets/images/plus.svg';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import ItemPreview from '@/components/ItemPreview';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import { defaultPageSize } from '@/consts';
import { ApiResourceDetailsTabs } from '@/consts/page-tabs';
import type { RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTheme from '@/hooks/use-theme';
import * as modalStyles from '@/scss/modal.module.scss';
import * as resourcesStyles from '@/scss/resources.module.scss';
import { Theme } from '@/types/theme';
import { buildUrl } from '@/utils/url';

import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const pageSize = defaultPageSize;
const apiResourcesPathname = '/api-resources';
const createApiResourcePathname = `${apiResourcesPathname}/create`;
const buildDetailsPathname = (id: string) =>
  `${apiResourcesPathname}/${id}/${ApiResourceDetailsTabs.Settings}`;

const ApiResources = () => {
  const { pathname, search } = useLocation();
  const isCreateNew = pathname.endsWith('/create');
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
  const navigate = useNavigate();
  const theme = useTheme();
  const [apiResources, totalCount] = data ?? [];

  const ResourceIcon = theme === Theme.Light ? ApiResource : ApiResourceDark;

  return (
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="api_resources.title" subtitle="api_resources.subtitle" />
        <Button
          title="api_resources.create"
          type="primary"
          size="large"
          icon={<Plus />}
          onClick={() => {
            navigate({
              pathname: createApiResourcePathname,
              search,
            });
          }}
        />
        <Modal
          shouldCloseOnEsc
          isOpen={isCreateNew}
          className={modalStyles.content}
          overlayClassName={modalStyles.overlay}
          onRequestClose={() => {
            navigate({
              pathname: apiResourcesPathname,
              search,
            });
          }}
        >
          <CreateForm
            onClose={(createdApiResource) => {
              if (createdApiResource) {
                toast.success(
                  t('api_resources.api_resource_created', { name: createdApiResource.name })
                );
                navigate(buildDetailsPathname(createdApiResource.id), { replace: true });

                return;
              }
              navigate({
                pathname: apiResourcesPathname,
                search,
              });
            }}
          />
        </Modal>
      </div>
      <Table
        className={resourcesStyles.table}
        rowGroups={[{ key: 'apiResources', data: apiResources }]}
        rowIndexKey="id"
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        columns={[
          {
            title: t('api_resources.api_name'),
            dataIndex: 'name',
            colSpan: 6,
            render: ({ id, name }) => (
              <ItemPreview
                title={name}
                icon={<ResourceIcon className={styles.icon} />}
                to={buildDetailsPathname(id)}
              />
            ),
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
        onRetry={async () => mutate(undefined, true)}
      />
      <Pagination
        page={page}
        totalCount={totalCount}
        pageSize={pageSize}
        className={styles.pagination}
        onChange={(page) => {
          updateSearchParameters({ page });
        }}
      />
    </div>
  );
};

export default ApiResources;
