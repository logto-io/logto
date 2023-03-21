import Button from '@/components/Button';
import type { RequestError } from '@/hooks/use-api';
import type { Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/images/plus.svg';
import ApplicationIcon from '@/components/ApplicationIcon';
import CardTitle from '@/components/CardTitle';
import CopyToClipboard from '@/components/CopyToClipboard';
import ItemPreview from '@/components/ItemPreview';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import { defaultPageSize } from '@/consts';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import * as resourcesStyles from '@/scss/resources.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';
import { withAppInsights } from '@/utils/app-insights';
import { buildUrl } from '@/utils/url';

import ApplicationsPlaceholder from './components/ApplicationsPlaceholder';
import CreateForm from './components/CreateForm';
import * as styles from './index.module.scss';

const pageSize = defaultPageSize;
const applicationsPathname = '/applications';
const createApplicationPathname = `${applicationsPathname}/create`;
const buildDetailsPathname = (id: string) => `${applicationsPathname}/${id}`;
const buildGuidePathname = (id: string) => `${buildDetailsPathname(id)}/guide`;

const buildNavigatePathPostAppCreation = ({ type, id }: Application) => {
  const build =
    type === ApplicationType.MachineToMachine ? buildDetailsPathname : buildGuidePathname;

  return build(id);
};

function Applications() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const isShowingCreationForm = pathname === createApplicationPathname;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [{ page }, updateSearchParameters] = useSearchParametersWatcher({
    page: 1,
  });

  const url = buildUrl('api/applications', {
    page: String(page),
    page_size: String(pageSize),
  });

  const { data, error, mutate } = useSWR<[Application[], number], RequestError>(url);

  const isLoading = !data && !error;
  const [applications, totalCount] = data ?? [];

  const mutateApplicationList = async (newApp: Application) => {
    await mutate([[newApp, ...(applications ?? [])], (totalCount ?? 0) + 1]);
  };

  return (
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="applications.title" subtitle="applications.subtitle" />
        <Button
          icon={<Plus />}
          title="applications.create"
          type="primary"
          size="large"
          onClick={() => {
            navigate({
              pathname: createApplicationPathname,
              search,
            });
          }}
        />
      </div>
      <Table
        className={resourcesStyles.table}
        rowGroups={[{ key: 'applications', data: applications }]}
        rowIndexKey="id"
        isLoading={isLoading}
        errorMessage={error?.body?.message ?? error?.message}
        columns={[
          {
            title: t('applications.application_name'),
            dataIndex: 'name',
            colSpan: 6,
            render: ({ id, name, type }) => (
              <ItemPreview
                title={name}
                subtitle={t(`${applicationTypeI18nKey[type]}.title`)}
                icon={<ApplicationIcon className={styles.icon} type={type} />}
                to={buildDetailsPathname(id)}
              />
            ),
          },
          {
            title: t('applications.app_id'),
            dataIndex: 'id',
            colSpan: 10,
            render: ({ id }) => <CopyToClipboard value={id} variant="text" />,
          },
        ]}
        placeholder={
          <ApplicationsPlaceholder
            onCreate={async (newApp) => {
              await mutateApplicationList(newApp);
              navigate(buildNavigatePathPostAppCreation(newApp), { replace: true });
            }}
          />
        }
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
      <CreateForm
        isOpen={isShowingCreationForm}
        onClose={async (newApp) => {
          if (newApp) {
            navigate(buildNavigatePathPostAppCreation(newApp), { replace: true });

            return;
          }
          navigate({
            pathname: applicationsPathname,
            search,
          });
        }}
      />
    </div>
  );
}

export default withAppInsights(Applications);
