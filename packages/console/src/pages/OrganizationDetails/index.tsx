import { type Organization } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
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

import Introduction from '../Organizations/Introduction';

import * as styles from './index.module.scss';
import { OrganizationDetailsTabs, type OrganizationDetailsOutletContext } from './types';

const pathname = '/organizations';

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
            <Introduction />
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
            <TabNavItem href={`${pathname}/${data.id}/${OrganizationDetailsTabs.Settings}`}>
              {t('general.settings_nav')}
            </TabNavItem>
            <TabNavItem href={`${pathname}/${data.id}/${OrganizationDetailsTabs.Members}`}>
              {t('organizations.members')}
            </TabNavItem>
          </TabNav>
          <Outlet
            context={
              {
                data,
                isDeleting,
                onUpdated: async (data) => mutate(data),
              } satisfies OrganizationDetailsOutletContext
            }
          />
        </>
      )}
    </DetailsPage>
  );
}

export default OrganizationDetails;
