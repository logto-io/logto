import { type AdminConsoleKey } from '@logto/phrases';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '@/ds-components/ConfirmModal';
import DataTransferBox from '@/ds-components/DataTransferBox';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TabWrapper from '@/ds-components/TabWrapper';

import { PermissionType } from './types';
import useOrganizationRolePermissionsAssignment from './use-organization-role-permissions-assignment';

const permissionTabs = {
  [PermissionType.Organization]: {
    title: 'organization_role_details.permissions.organization_permissions',
    key: PermissionType.Organization,
  },
  [PermissionType.Api]: {
    title: 'organization_role_details.permissions.api_permissions',
    key: PermissionType.Api,
  },
} satisfies {
  [key in PermissionType]: {
    title: AdminConsoleKey;
    key: key;
  };
};

type Props = {
  readonly organizationRoleId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

function OrganizationRolePermissionsAssignmentModal({
  organizationRoleId,
  isOpen,
  onClose,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    activeTab,
    setActiveTab,
    onSubmit,
    organizationScopesAssignment,
    resourceScopesAssignment,
    clearSelectedData,
    isLoading,
  } = useOrganizationRolePermissionsAssignment(organizationRoleId);

  const onCloseHandler = useCallback(() => {
    onClose();
    clearSelectedData();
    setActiveTab(PermissionType.Organization);
  }, [clearSelectedData, onClose, setActiveTab]);

  const onSubmitHandler = useCallback(async () => {
    await onSubmit();
    onCloseHandler();
  }, [onCloseHandler, onSubmit]);

  const tabs = useMemo(
    () =>
      Object.values(permissionTabs).map(({ title, key }) => {
        const selectedDataCount =
          key === PermissionType.Organization
            ? organizationScopesAssignment.selectedData.length
            : resourceScopesAssignment.selectedData.length;

        return (
          <TabNavItem
            key={key}
            isActive={key === activeTab}
            onClick={() => {
              setActiveTab(key);
            }}
          >
            {`${t(title)}${selectedDataCount ? ` (${selectedDataCount})` : ''}`}
          </TabNavItem>
        );
      }),
    [
      activeTab,
      organizationScopesAssignment.selectedData.length,
      resourceScopesAssignment.selectedData.length,
      setActiveTab,
      t,
    ]
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      title="organization_role_details.permissions.assign_permissions"
      subtitle="organization_role_details.permissions.assign_description"
      confirmButtonType="primary"
      confirmButtonText="general.save"
      cancelButtonText="general.skip"
      size="large"
      onCancel={onCloseHandler}
      onConfirm={onSubmitHandler}
    >
      <TabNav>{tabs}</TabNav>
      <TabWrapper
        key={PermissionType.Organization}
        isActive={PermissionType.Organization === activeTab}
      >
        <DataTransferBox
          title="organization_role_details.permissions.assign_organization_permissions"
          {...organizationScopesAssignment}
        />
      </TabWrapper>
      <TabWrapper key={PermissionType.Api} isActive={PermissionType.Api === activeTab}>
        <DataTransferBox
          title="organization_role_details.permissions.assign_api_permissions"
          {...resourceScopesAssignment}
        />
      </TabWrapper>
    </ConfirmModal>
  );
}

export default OrganizationRolePermissionsAssignmentModal;
