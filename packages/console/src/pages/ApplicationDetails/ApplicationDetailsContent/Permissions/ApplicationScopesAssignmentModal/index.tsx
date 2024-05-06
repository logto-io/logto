import { type AdminConsoleKey } from '@logto/phrases';
import { ApplicationUserConsentScopeType } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '@/ds-components/ConfirmModal';
import DataTransferBox from '@/ds-components/DataTransferBox';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import TabWrapper from '@/ds-components/TabWrapper';

import { permissionTabs } from './constants';
import useApplicationScopesAssignment from './use-application-scopes-assignment';

const modalText = Object.freeze({
  title: 'application_details.permissions.table_name',
  subtitle: 'application_details.permissions.permissions_assignment_description',
  saveBtn: 'general.save',
}) satisfies Record<string, AdminConsoleKey>;

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly applicationId: string;
};

function ApplicationScopesAssignmentModal({ isOpen, onClose, applicationId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { activeTab, setActiveTab, scopesAssignment, clearSelectedData, onSubmit, isLoading } =
    useApplicationScopesAssignment(applicationId);

  const onCloseHandler = useCallback(() => {
    onClose();
    clearSelectedData();
    setActiveTab(ApplicationUserConsentScopeType.UserScopes);
  }, [clearSelectedData, onClose, setActiveTab]);

  const onSubmitHandler = useCallback(async () => {
    await onSubmit();
    onCloseHandler();
  }, [onCloseHandler, onSubmit]);

  // If any of the tabs has selected scopes, the modal is dirty
  const isDirty = Object.values(scopesAssignment).some(
    ({ selectedData }) => selectedData.length > 0
  );

  const tabs = useMemo(
    () =>
      Object.values(permissionTabs)
        /**
         * Hide the organization resource scopes tab since the feature is not ready.
         * We don't need the `isDevFeaturesEnabled` flag since the feature will change the UI.
         * Todo @xiaoyijun Implement the new organization resource scopes feature. LOG-8823
         */
        .filter(({ key }) => key !== ApplicationUserConsentScopeType.OrganizationResourceScopes)
        .map(({ title, key }) => {
          const selectedDataCount = scopesAssignment[key].selectedData.length;

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
    [activeTab, scopesAssignment, setActiveTab, t]
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      title={modalText.title}
      subtitle={modalText.subtitle}
      isConfirmButtonDisabled={!isDirty}
      confirmButtonType="primary"
      confirmButtonText={modalText.saveBtn}
      isCancelButtonVisible={false}
      size="large"
      onCancel={onCloseHandler}
      onConfirm={onSubmitHandler}
    >
      <TabNav>{tabs}</TabNav>
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
        <DataTransferBox {...scopesAssignment[ApplicationUserConsentScopeType.ResourceScopes]} />
      </TabWrapper>
      <TabWrapper
        key={ApplicationUserConsentScopeType.OrganizationScopes}
        isActive={ApplicationUserConsentScopeType.OrganizationScopes === activeTab}
      >
        <DataTransferBox
          {...scopesAssignment[ApplicationUserConsentScopeType.OrganizationScopes]}
        />
      </TabWrapper>
    </ConfirmModal>
  );
}

export default ApplicationScopesAssignmentModal;
