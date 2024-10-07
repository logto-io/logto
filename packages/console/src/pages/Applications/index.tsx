import { ApplicationType, type Application } from '@logto/schemas';
import { type Nullable, joinPath, cond } from '@silverhand/essentials';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import Plus from '@/assets/icons/plus.svg?react';
import ApplicationCreation from '@/components/ApplicationCreation';
import { type SelectedGuide } from '@/components/Guide/GuideCard';
import ApplicationPreview from '@/components/ItemPreview/ApplicationPreview';
import PageMeta from '@/components/PageMeta';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import Table from '@/ds-components/Table';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import pageLayout from '@/scss/page-layout.module.scss';
import { buildUrl } from '@/utils/url';

import GuideLibrary from './components/GuideLibrary';
import GuideLibraryModal from './components/GuideLibraryModal';
import ProtectedAppModal from './components/ProtectedAppModal';
import useApplicationsData from './hooks/use-application-data';
import styles from './index.module.scss';

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
  /**
   * Selected guide from the guide library
   * - `undefined`: No guide is selected
   * - `null`: Create application without a framework guide
   * - `selectedGuide`: Create application with the selected guide
   */
  const [selectedGuide, setSelectedGuide] = useState<Nullable<SelectedGuide>>();

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

  const onAppCreationCompleted = useCallback(
    (newApp?: Application) => {
      if (newApp) {
        /**
         * Navigate to the application details page if no framework guide is selected or the selected guide is third party
         */
        if (selectedGuide === null || selectedGuide?.metadata.skipGuideAfterCreation) {
          navigate(`/applications/${newApp.id}`, { replace: true });
          setSelectedGuide(undefined);
          return;
        }

        // Create application from the framework guide
        if (selectedGuide) {
          navigate(`/applications/${newApp.id}/guide/${selectedGuide.id}`, { replace: true });
          setSelectedGuide(undefined);
          return;
        }
      }

      setSelectedGuide(undefined);
    },
    [navigate, selectedGuide]
  );

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
          <GuideLibrary
            hasCardBorder
            hasCardButton
            className={styles.library}
            onSelectGuide={setSelectedGuide}
          />
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
              render: (data) => <ApplicationPreview data={data} />,
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
        onSelectGuide={setSelectedGuide}
      />
      {selectedGuide !== undefined && (
        <ApplicationCreation
          defaultCreateType={cond(
            selectedGuide?.metadata.target !== 'API' && selectedGuide?.metadata.target
          )}
          defaultCreateFrameworkName={selectedGuide?.metadata.name ?? undefined}
          isDefaultCreateThirdParty={selectedGuide?.metadata.isThirdParty ?? undefined}
          onCompleted={onAppCreationCompleted}
        />
      )}
      {selectedGuide?.metadata.target === ApplicationType.Protected && (
        <ProtectedAppModal
          onClose={() => {
            setSelectedGuide(undefined);
          }}
        />
      )}
    </div>
  );
}

export default Applications;
