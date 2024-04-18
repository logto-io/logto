import { type OrganizationRole } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg';
import OrgRoleIcon from '@/assets/icons/role-feature.svg';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import PageMeta from '@/components/PageMeta';
import ThemedIcon from '@/components/ThemedIcon';
import { OrganizationRoleDetailsTabs, OrganizationTemplateTabs } from '@/consts';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useApi, { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import * as styles from './index.module.scss';
import { type OrganizationRoleDetailsOutletContext } from './types';

// Console path for organization roles
const organizationRolesPath = `/organization-template/${OrganizationTemplateTabs.OrganizationRoles}`;

// API endpoint for organization roles
const organizationRolesEndpoint = 'api/organization-roles';

function OrganizationRoleDetails() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { id } = useParams();
  const { navigate } = useTenantPathname();
  const { pathname } = useLocation();
  const isPageHasTable = pathname.endsWith(OrganizationRoleDetailsTabs.Permissions);

  const { data, error, mutate, isLoading } = useSWR<OrganizationRole, RequestError>(
    id && `${organizationRolesEndpoint}/${id}`
  );
  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [isDeletionAlertOpen, setIsDeletionAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close deletion alert when navigating to another page
  useEffect(() => {
    setIsDeletionAlertOpen(false);
  }, [pathname]);

  const handleDelete = async () => {
    if (!data) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`${organizationRolesEndpoint}/${data.id}`);
      toast.success(t('organization_role_details.deleted', { name: data.name }));
      await mutateGlobal(organizationRolesEndpoint);
      navigate(organizationRolesPath, { replace: true });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DetailsPage
      backLink={organizationRolesPath}
      backLinkTitle="organization_role_details.back_to_org_roles"
      isLoading={isLoading}
      error={error}
      className={classNames(isPageHasTable && styles.withTable)}
      onRetry={mutate}
    >
      <PageMeta titleKey="organization_role_details.page_title" />
      {data && (
        <>
          <DetailsPageHeader
            icon={<ThemedIcon for={OrgRoleIcon} size={60} />}
            title={data.name}
            primaryTag={t('organization_role_details.org_role')}
            identifier={{ name: 'ID', value: data.id }}
            actionMenuItems={[
              {
                title: 'general.delete',
                icon: <Delete />,
                type: 'danger',
                onClick: () => {
                  setIsDeletionAlertOpen(true);
                },
              },
            ]}
          />
          <ConfirmModal
            isOpen={isDeletionAlertOpen}
            isLoading={isDeleting}
            confirmButtonText="general.delete"
            onCancel={() => {
              setIsDeletionAlertOpen(false);
            }}
            onConfirm={handleDelete}
          >
            <DynamicT forKey="organization_role_details.delete_confirm" />
          </ConfirmModal>
          <TabNav>
            <TabNavItem
              href={`${organizationRolesPath}/${data.id}/${OrganizationRoleDetailsTabs.Permissions}`}
            >
              <DynamicT forKey="organization_role_details.permissions.tab" />
            </TabNavItem>
            <TabNavItem
              href={`${organizationRolesPath}/${data.id}/${OrganizationRoleDetailsTabs.General}`}
            >
              <DynamicT forKey="organization_role_details.general.tab" />
            </TabNavItem>
          </TabNav>
          <Outlet
            context={
              {
                organizationRole: data,
                isDeleting,
                onOrganizationRoleUpdated: mutate,
              } satisfies OrganizationRoleDetailsOutletContext
            }
          />
        </>
      )}
    </DetailsPage>
  );
}

export default OrganizationRoleDetails;
