import {
  type OrganizationJitEmailDomain,
  type Organization,
  type OrganizationRole,
  type SsoConnector,
} from '@logto/schemas';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import useSWR from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import File from '@/assets/icons/file.svg?react';
import OrganizationIcon from '@/assets/icons/organization-preview.svg?react';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Drawer from '@/components/Drawer';
import PageMeta from '@/components/PageMeta';
import ThemedIcon from '@/components/ThemedIcon';
import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useApi, { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import Introduction from '../Organizations/Introduction';

import styles from './index.module.scss';
import { OrganizationDetailsTabs, type OrganizationDetailsOutletContext } from './types';

const pathname = '/organizations';

// eslint-disable-next-line complexity
function OrganizationDetails() {
  const { id } = useParams();
  const { navigate } = useTenantPathname();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const organization = useSWR<Organization, RequestError>(id && `api/organizations/${id}`);
  const jitEmailDomains = useSWR<OrganizationJitEmailDomain[], RequestError>(
    id && `api/organizations/${id}/jit/email-domains`
  );
  const jitRoles = useSWR<OrganizationRole[], RequestError>(
    id && `api/organizations/${id}/jit/roles`
  );
  const jitSsoConnectors = useSWR<SsoConnector[], RequestError>(
    id && `api/organizations/${id}/jit/sso-connectors`
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

  const isLoading =
    (!organization.data && !organization.error) ||
    (!jitEmailDomains.data && !jitEmailDomains.error) ||
    (!jitRoles.data && !jitRoles.error) ||
    (!jitSsoConnectors.data && !jitSsoConnectors.error);

  const error =
    organization.error ?? jitEmailDomains.error ?? jitRoles.error ?? jitSsoConnectors.error;

  return (
    <DetailsPage
      backLink={pathname}
      backLinkTitle="organizations.title"
      className={styles.page}
      isLoading={isLoading}
      error={error}
    >
      <PageMeta titleKey="organization_details.page_title" />
      {id &&
        organization.data &&
        jitEmailDomains.data &&
        jitRoles.data &&
        jitSsoConnectors.data && (
          <>
            <DetailsPageHeader
              icon={<ThemedIcon for={OrganizationIcon} size={60} />}
              title={organization.data.name}
              identifier={{ name: t('organization_details.organization_id'), value: id }}
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
              <TabNavItem href={`${pathname}/${id}/${OrganizationDetailsTabs.Settings}`}>
                {t('general.settings_nav')}
              </TabNavItem>
              <TabNavItem href={`${pathname}/${id}/${OrganizationDetailsTabs.Members}`}>
                {t('organizations.members')}
              </TabNavItem>

              <TabNavItem href={`${pathname}/${id}/${OrganizationDetailsTabs.MachineToMachine}`}>
                {t('organizations.machine_to_machine')}
              </TabNavItem>
            </TabNav>
            <Outlet
              context={
                {
                  data: organization.data,
                  jit: {
                    emailDomains: jitEmailDomains.data,
                    roles: jitRoles.data,
                    ssoConnectorIds: jitSsoConnectors.data.map(({ id }) => id),
                  },
                  isDeleting,
                  onUpdated: async (data) => organization.mutate(data),
                } satisfies OrganizationDetailsOutletContext
              }
            />
          </>
        )}
    </DetailsPage>
  );
}

export default OrganizationDetails;
