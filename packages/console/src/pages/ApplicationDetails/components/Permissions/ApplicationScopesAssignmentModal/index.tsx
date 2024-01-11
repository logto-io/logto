import { type AdminConsoleKey } from '@logto/phrases';
import { ApplicationUserConsentScopeType } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import ScopesAssignmentModal from '@/components/ScopesAssignmentModal';
import ScopesAssignmentForm from '@/components/ScopesAssignmentModal/ScopesAssignmentForm';
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
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
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
    ({ selectedScopes }) => selectedScopes.length > 0
  );

  return (
    <ScopesAssignmentModal
      isOpen={isOpen}
      isLoading={isLoading}
      modalText={modalText}
      isSubmitDisabled={!isDirty}
      tabElement={
        <TabNav>
          {Object.values(permissionTabs).map(({ title, key }) => (
            <TabNavItem
              key={key}
              isActive={key === activeTab}
              onClick={() => {
                setActiveTab(key);
              }}
            >
              {`${t(title)}(${scopesAssignment[key].selectedScopes.length})`}
            </TabNavItem>
          ))}
        </TabNav>
      }
      onClose={onCloseHandler}
      onSubmit={onSubmitHandler}
    >
      {Object.values(scopesAssignment).map(({ scopeType, ...reset }) => (
        <TabWrapper key={scopeType} isActive={scopeType === activeTab}>
          <ScopesAssignmentForm {...reset} />
        </TabWrapper>
      ))}
    </ScopesAssignmentModal>
  );
}

export default ApplicationScopesAssignmentModal;
