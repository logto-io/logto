import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import { type OrganizationRole } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
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

import Permissions from './Permissions';
import Settings from './Settings';

const orgRolesPath = `/organization-template/${OrganizationTemplateTabs.OrganizationRoles}`;

function OrganizationRoleDetails() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { id } = useParams();
  const { navigate } = useTenantPathname();

  const { data, error, mutate, isLoading } = useSWR<OrganizationRole, RequestError>(
    id && `api/organization-roles/${id}`
  );
  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [isDeletionAlertOpen, setIsDeletionAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!data) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`api/organization-roles/${data.id}`);
      toast.success(t('organization_role_details.deleted', { name: data.name }));
      await mutateGlobal('api/roles');
      navigate(orgRolesPath, { replace: true });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DetailsPage
      backLink={orgRolesPath}
      backLinkTitle="organization_role_details.back_to_org_roles"
      isLoading={isLoading}
      error={error}
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
              href={`${orgRolesPath}/${data.id}/${OrganizationRoleDetailsTabs.Permissions}`}
            >
              <DynamicT forKey="organization_role_details.permissions.tab" />
            </TabNavItem>
            <TabNavItem href={`${orgRolesPath}/${data.id}/${OrganizationRoleDetailsTabs.General}`}>
              <DynamicT forKey="organization_role_details.general.tab" />
            </TabNavItem>
          </TabNav>
          <Routes>
            <Route
              index
              element={<Navigate replace to={OrganizationRoleDetailsTabs.Permissions} />}
            />
            <Route
              path={OrganizationRoleDetailsTabs.Permissions}
              element={<Permissions organizationRoleId={data.id} />}
            />
            <Route
              path={OrganizationRoleDetailsTabs.General}
              element={<Settings data={data} onUpdate={mutate} />}
            />
          </Routes>
        </>
      )}
    </DetailsPage>
  );
}

export default withAppInsights(OrganizationRoleDetails);
