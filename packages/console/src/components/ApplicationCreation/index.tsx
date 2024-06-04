import { ApplicationType, RoleType, type Application } from '@logto/schemas';
import { useCallback, useState } from 'react';

import RoleAssignmentModal from '@/components/RoleAssignmentModal';

import CreateForm, { type Props as CreateApplicationFormProps } from './CreateForm';

type Props = Omit<CreateApplicationFormProps, 'onClose'> & {
  /**
   * The callback function that will be called when the application creation process is completed or canceled.
   */
  readonly onCompleted?: (createdApp?: Application) => void;
};

/**
 * The component for handling application creation (including create an application and setup its permissions if needed).
 */
function ApplicationCreation({ onCompleted, ...reset }: Props) {
  const [createdMachineToMachineApplication, setCreatedMachineToMachineApplication] =
    useState<Application>();

  const createFormModalCloseHandler = useCallback(
    (createdApp?: Application) => {
      if (createdApp?.type === ApplicationType.MachineToMachine) {
        setCreatedMachineToMachineApplication(createdApp);
        return;
      }

      onCompleted?.(createdApp);
    },
    [onCompleted]
  );

  if (createdMachineToMachineApplication) {
    return (
      <RoleAssignmentModal
        isSkippable
        entity={createdMachineToMachineApplication}
        type={RoleType.MachineToMachine}
        onClose={() => {
          onCompleted?.(createdMachineToMachineApplication);
        }}
      />
    );
  }

  return <CreateForm {...reset} onClose={createFormModalCloseHandler} />;
}

export default ApplicationCreation;
