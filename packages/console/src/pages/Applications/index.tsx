import { withAppInsights } from '@logto/app-insights/react';
import type { Application } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import Plus from '@/assets/icons/plus.svg';
import ApplicationIcon from '@/components/ApplicationIcon';
import ChargeNotification from '@/components/ChargeNotification';
import ItemPreview from '@/components/ItemPreview';
import PageMeta from '@/components/PageMeta';
import { defaultPageSize } from '@/consts';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import Table from '@/ds-components/Table';
import type { RequestError } from '@/hooks/use-api';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useSearchParametersWatcher from '@/hooks/use-search-parameters-watcher';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as pageLayout from '@/scss/page-layout.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';
import { buildUrl } from '@/utils/url';

import GuideLibrary from './components/GuideLibrary';
import GuideLibraryModal from './components/GuideLibraryModal';
import * as styles from './index.module.scss';

const pageSize = defaultPageSize;
const applicationsPathname = '/applications';
const createApplicationPathname = `${applicationsPathname}/create`;
const buildDetailsPathname = (id: string) => `${applicationsPathname}/${id}`;

function Applications() {
  const { search } = useLocation();
  const { match, navigate } = useTenantPathname();
  const isCreating = match(createApplicationPathname);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { hasMachineToMachineAppsSurpassedLimit } = useApplicationsUsage();
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
    <div className={pageLayout.container}>
      <PageMeta titleKey="applications.title" />
      <div className={pageLayout.headline}>
        <CardTitle title="applications.title" subtitle="applications.subtitle" />
        {!!totalCount && (
          <Button
            icon={<Plus />}
            type="primary"
            size="large"
            title="applications.create"
            onClick={() => {
              navigate({
                pathname: createApplicationPathname,
                search,
              });
            }}
          />
        )}
      </div>
      {isCloud && (
        <ChargeNotification
          hasSurpassedLimit={hasMachineToMachineAppsSurpassedLimit}
          quotaItemPhraseKey="machine_to_machine"
          className={styles.chargeNotification}
          checkedFlagKey="machineToMachineApp"
        />
      )}
      {!isLoading && !applications?.length && (
        <OverlayScrollbar className={styles.guideLibraryContainer}>
          <CardTitle
            className={styles.title}
            title="guide.app.select_framework_or_tutorial"
            subtitle="guide.app.modal_subtitle"
          />
          <GuideLibrary hasCardBorder hasCardButton className={styles.library} />
        </OverlayScrollbar>
      )}
      {(isLoading || !!applications?.length) && (
        <Table
          isLoading={isLoading}
          className={pageLayout.table}
          rowGroups={[{ key: 'applications', data: applications }]}
          rowIndexKey="id"
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
      )}
      <GuideLibraryModal
        isOpen={isCreating}
        onClose={() => {
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
