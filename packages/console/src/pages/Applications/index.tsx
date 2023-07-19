import { withAppInsights } from '@logto/app-insights/react';
import type { Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import ApplicationIcon from '@/components/ApplicationIcon';
import ItemPreview from '@/components/ItemPreview';
import ListPage from '@/components/ListPage';
import { defaultPageSize } from '@/consts';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import type { RequestError } from '@/hooks/use-api';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { applicationTypeI18nKey } from '@/types/applications';
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
  const { search } = useLocation();
  const { match, navigate } = useTenantPathname();
  const isCreating = match(createApplicationPathname);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [defaultCreateType, setDefaultCreateType] = useState<ApplicationType>();
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

  return (
    <ListPage
      title={{
        title: 'applications.title',
        subtitle: 'applications.subtitle',
      }}
      pageMeta={{ titleKey: 'applications.title' }}
      createButton={{
        title: 'applications.create',
        onClick: () => {
          navigate({
            pathname: createApplicationPathname,
            search,
          });
        },
      }}
      table={{
        rowGroups: [{ key: 'applications', data: applications }],
        rowIndexKey: 'id',
        isLoading,
        errorMessage: error?.body?.message ?? error?.message,
        columns: [
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
        ],
        placeholder: (
          <ApplicationsPlaceholder
            onSelect={async (createType) => {
              setDefaultCreateType(createType);
              navigate({
                pathname: createApplicationPathname,
                search,
              });
            }}
          />
        ),
        rowClickHandler: ({ id }) => {
          navigate(buildDetailsPathname(id));
        },
        onRetry: async () => mutate(undefined, true),
        pagination: {
          page,
          totalCount,
          pageSize,
          onChange: (page) => {
            updateSearchParameters({ page });
          },
        },
      }}
      widgets={
        <CreateForm
          defaultCreateType={defaultCreateType}
          isOpen={isCreating}
          onClose={async (newApp) => {
            setDefaultCreateType(undefined);
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
      }
    />
  );
}

export default withAppInsights(Applications);
