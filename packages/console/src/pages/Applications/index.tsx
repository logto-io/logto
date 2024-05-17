import { joinPath } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import Plus from '@/assets/icons/plus.svg';
import ApplicationIcon from '@/components/ApplicationIcon';
import ChargeNotification from '@/components/ChargeNotification';
import ItemPreview from '@/components/ItemPreview';
import PageMeta from '@/components/PageMeta';
import { isCloud } from '@/consts/env';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import Table from '@/ds-components/Table';
import useApplicationsUsage from '@/hooks/use-applications-usage';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as pageLayout from '@/scss/page-layout.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';
import { buildUrl } from '@/utils/url';

import GuideLibrary from './components/GuideLibrary';
import GuideLibraryModal from './components/GuideLibraryModal';
import useApplicationsData from './hooks/use-application-data';
import * as styles from './index.module.scss';

const tabs = Object.freeze({
  thirdPartyApplications: 'third-party-applications',
});

const applicationsPathname = '/applications';
const createApplicationPathname = `${applicationsPathname}/create`;
const buildDetailsPathname = (id: string) => `${applicationsPathname}/${id}`;

// Build the path with pagination query param for the tabs
const buildTabPathWithPagePagination = (page: number, tab?: keyof typeof tabs) => {
  const pathname = tab
    ? joinPath(applicationsPathname, tabs.thirdPartyApplications)
    : applicationsPathname;

  return page > 1 ? buildUrl(pathname, { page: String(page) }) : pathname;
};

type Props = {
  readonly tab?: keyof typeof tabs;
};

function Applications({ tab }: Props) {
  const { search } = useLocation();
  const { match, navigate } = useTenantPathname();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isCreating = match(createApplicationPathname);
  const { hasMachineToMachineAppsSurpassedLimit } = useApplicationsUsage();

  const {
    data,
    error,
    mutate,
    pagination,
    updatePagination,
    paginationRecords,
    showThirdPartyApplicationTab,
  } = useApplicationsData(tab === 'thirdPartyApplications');

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

      {showThirdPartyApplicationTab && (
        <TabNav className={styles.tabs}>
          <TabNavItem
            href={buildTabPathWithPagePagination(paginationRecords.firstPartyApplicationPage)}
            isActive={!tab}
          >
            {t('applications.tab.my_applications')}
          </TabNavItem>
          <TabNavItem
            href={buildTabPathWithPagePagination(
              paginationRecords.thirdPartyApplicationPage,
              'thirdPartyApplications'
            )}
            isActive={tab === 'thirdPartyApplications'}
          >
            {t('applications.tab.third_party_applications')}
          </TabNavItem>
        </TabNav>
      )}

      {!isLoading && !applications?.length && (
        <div className={styles.guideLibraryContainer}>
          <CardTitle
            className={styles.title}
            title="guide.app.select_framework_or_tutorial"
            subtitle="guide.app.modal_subtitle"
          />
          <GuideLibrary hasCardBorder hasCardButton className={styles.library} />
        </div>
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
              render: ({ id, name, type, isThirdParty }) => (
                <ItemPreview
                  title={name}
                  subtitle={
                    isThirdParty
                      ? t(`${applicationTypeI18nKey.thirdParty}.title`)
                      : t(`${applicationTypeI18nKey[type]}.title`)
                  }
                  icon={
                    <ApplicationIcon
                      className={styles.icon}
                      type={type}
                      isThirdParty={isThirdParty}
                    />
                  }
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
            ...pagination,
            totalCount,
            onChange: updatePagination,
          }}
          onRetry={async () => mutate(undefined, true)}
        />
      )}
      <GuideLibraryModal
        isOpen={isCreating}
        onClose={() => {
          navigate(-1);
        }}
      />
    </div>
  );
}

export default Applications;
