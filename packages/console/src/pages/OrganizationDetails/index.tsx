import { type Organization } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
// FIXME: @gao
// eslint-disable-next-line no-restricted-imports
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg';
import File from '@/assets/icons/file.svg';
import OrganizationIcon from '@/assets/icons/organization-preview.svg';
import AppError from '@/components/AppError';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Skeleton from '@/components/DetailsPage/Skeleton';
import Drawer from '@/components/Drawer';
import PageMeta from '@/components/PageMeta';
import ThemedIcon from '@/components/ThemedIcon';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useApi, { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import Introduction from '../Organizations/Guide/Introduction';

import Members from './Members';
import Settings from './Settings';
import * as styles from './index.module.scss';

const pathname = '/organizations';
const tabs = Object.freeze({
  settings: 'settings',
  members: 'members',
});

function OrganizationDetails() {
  const { id } = useParams();
  const { navigate } = useTenantPathname();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Organization, RequestError>(
    id && `api/organizations/${id}`
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGuideDrawerOpen, setIsGuideDrawerOpen] = useState(false);
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState(false);
  const api = useApi();

  const deleteOrganization = useCallback(async () => {
    if (!id || isDeleting) {
      return;
    }
    setIsDeleting(true);

    try {
      await api.delete(`api/organizations/${id}`);
      navigate(pathname);
    } finally {
      setIsDeleting(false);
    }
  }, [api, id, isDeleting, navigate]);

  const isLoading = !data && !error;

  return (
    <DetailsPage backLink={pathname} backLinkTitle="organizations.title" className={styles.page}>
      <PageMeta titleKey="organization_details.page_title" />
      {isLoading && <Skeleton />}
      {error && <AppError errorCode={error.body?.code} errorMessage={error.body?.message} />}
      {data && (
        <>
          <DetailsPageHeader
            icon={<ThemedIcon for={OrganizationIcon} size={60} />}
            title={data.name}
            identifier={{ name: t('organization_details.organization_id'), value: data.id }}
            additionalActionButton={{
              icon: <File />,
              title: 'application_details.check_guide',
              onClick: () => {
                setIsGuideDrawerOpen(true);
              },
            }}
            actionMenuItems={[
              {
                icon: <Delete />,
                title: 'general.delete',
                type: 'danger',
                onClick: () => {
                  setIsDeleteFormOpen(true);
                },
              },
            ]}
          />
          <Drawer
            title="organizations.guide.title"
            subtitle="organizations.guide.subtitle"
            isOpen={isGuideDrawerOpen}
            onClose={() => {
              setIsGuideDrawerOpen(false);
            }}
          >
            <Introduction isReadonly />
          </Drawer>
          <DeleteConfirmModal
            isOpen={isDeleteFormOpen}
            isLoading={isDeleting}
            onCancel={() => {
              setIsDeleteFormOpen(false);
            }}
            onConfirm={deleteOrganization}
          >
            {t('organization_details.delete_confirmation')}
          </DeleteConfirmModal>
          <TabNav>
            <TabNavItem href={`${pathname}/${data.id}/${tabs.settings}`}>
              {t('general.settings_nav')}
            </TabNavItem>
            <TabNavItem href={`${pathname}/${data.id}/${tabs.members}`}>
              {t('organizations.members')}
            </TabNavItem>
          </TabNav>
          <Routes>
            <Route index element={<Navigate replace to={tabs.settings} />} />
            <Route
              path={tabs.settings}
              element={
                <Settings
                  isDeleting={isDeleting}
                  data={data}
                  onUpdated={async (data) => mutate(data)}
                />
              }
            />
            <Route path={tabs.members} element={<Members organization={data} />} />
          </Routes>
        </>
      )}
    </DetailsPage>
  );
}

export default OrganizationDetails;
