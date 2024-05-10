import { type AdminConsoleKey } from '@logto/phrases';
import { ApplicationUserConsentScopeType } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '@/ds-components/ConfirmModal';
import DataTransferBox from '@/ds-components/DataTransferBox';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TabWrapper from '@/ds-components/TabWrapper';

import {
  allLevelPermissionTabs,
  organizationLevelPermissionsTab,
  userLevelPermissionsTabs,
} from './constants';
import { ScopeLevel } from './type';
import useApplicationScopesAssignment from './use-application-scopes-assignment';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly applicationId: string;
  readonly scopeLevel: ScopeLevel;
};

function ApplicationScopesAssignmentModal({ isOpen, onClose, applicationId, scopeLevel }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { activeTab, setActiveTab, scopesAssignment, clearSelectedData, onSubmit, isLoading } =
    useApplicationScopesAssignment(applicationId, scopeLevel);

  const onCloseHandler = useCallback(() => {
    onClose();
    clearSelectedData();
    setActiveTab(
      scopeLevel === ScopeLevel.Organization
        ? ApplicationUserConsentScopeType.OrganizationScopes
        : ApplicationUserConsentScopeType.UserScopes
    );
  }, [clearSelectedData, onClose, scopeLevel, setActiveTab]);

  const onSubmitHandler = useCallback(async () => {
    await onSubmit();
    onCloseHandler();
  }, [onCloseHandler, onSubmit]);

  // If any of the tabs has selected scopes, the modal is dirty
  const isDirty = useMemo(
    () => Object.values(scopesAssignment).some(({ selectedData }) => selectedData.length > 0),
    [scopesAssignment]
  );

  const tabs = useMemo(() => {
    const getPermissionTabs = () => {
      if (scopeLevel === ScopeLevel.All) {
        return allLevelPermissionTabs;
      }

      return scopeLevel === ScopeLevel.User
        ? userLevelPermissionsTabs
        : organizationLevelPermissionsTab;
    };

    return Object.values(getPermissionTabs()).map(({ title, key }) => {
      const selectedDataCount = scopesAssignment[key].selectedData.length;

      return (
        <TabNavItem
          key={key}
          isActive={key === activeTab}
          onClick={() => {
            setActiveTab(key);
          }}
        >
          {`${String(t(title))}${selectedDataCount ? ` (${selectedDataCount})` : ''}`}
        </TabNavItem>
      );
    });
  }, [activeTab, scopeLevel, scopesAssignment, setActiveTab, t]);

  const modalText = useMemo<{
    title: AdminConsoleKey;
    subtitle: AdminConsoleKey;
    saveButton: AdminConsoleKey;
  }>(() => {
    if (scopeLevel === ScopeLevel.All) {
      return {
        title: 'application_details.permissions.table_name',
        subtitle: 'application_details.permissions.permissions_assignment_description',
        saveButton: 'general.save',
      };
    }

    const scopeLevelPhrase = scopeLevel === ScopeLevel.User ? 'user' : 'organization';

    return {
      title: `application_details.permissions.grant_${scopeLevelPhrase}_level_permissions`,
      subtitle: `application_details.permissions.${scopeLevelPhrase}_description`,
      saveButton: 'general.save',
    };
  }, [scopeLevel]);

  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      title={modalText.title}
      subtitle={modalText.subtitle}
      isConfirmButtonDisabled={!isDirty}
      confirmButtonType="primary"
      confirmButtonText={modalText.saveButton}
      isCancelButtonVisible={false}
      size="large"
      onCancel={onCloseHandler}
      onConfirm={onSubmitHandler}
    >
      <TabNav>{tabs}</TabNav>
      {(scopeLevel === ScopeLevel.All || scopeLevel === ScopeLevel.User) && (
        <>
          <TabWrapper
            key={ApplicationUserConsentScopeType.UserScopes}
            isActive={ApplicationUserConsentScopeType.UserScopes === activeTab}
          >
            <DataTransferBox {...scopesAssignment[ApplicationUserConsentScopeType.UserScopes]} />
          </TabWrapper>
          <TabWrapper
            key={ApplicationUserConsentScopeType.ResourceScopes}
            isActive={ApplicationUserConsentScopeType.ResourceScopes === activeTab}
          >
            <DataTransferBox
              {...scopesAssignment[ApplicationUserConsentScopeType.ResourceScopes]}
            />
          </TabWrapper>
        </>
      )}
      {(scopeLevel === ScopeLevel.All || scopeLevel === ScopeLevel.Organization) && (
        <TabWrapper
          key={ApplicationUserConsentScopeType.OrganizationScopes}
          isActive={ApplicationUserConsentScopeType.OrganizationScopes === activeTab}
        >
          <DataTransferBox
            {...scopesAssignment[ApplicationUserConsentScopeType.OrganizationScopes]}
          />
        </TabWrapper>
      )}
      {scopeLevel === ScopeLevel.Organization && (
        <TabWrapper
          key={ApplicationUserConsentScopeType.OrganizationResourceScopes}
          isActive={ApplicationUserConsentScopeType.OrganizationResourceScopes === activeTab}
        >
          <DataTransferBox
            {...scopesAssignment[ApplicationUserConsentScopeType.OrganizationResourceScopes]}
          />
        </TabWrapper>
      )}
    </ConfirmModal>
  );
}

export default ApplicationScopesAssignmentModal;
