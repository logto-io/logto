import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { useUnsavedChangesAlertModal } from '@/hooks/use-unsaved-changes-alert-modal';

import SignInMethodsForm from '../components/SignInMethodsForm';
import { SignInExperienceForm } from '../types';

type Props = {
  defaultData: SignInExperienceForm;
  isDataDirty: boolean;
};

const SignInMethodsTab = ({ defaultData, isDataDirty }: Props) => {
  const { reset } = useFormContext<SignInExperienceForm>();

  useEffect(() => {
    reset(defaultData);

    return () => {
      reset(defaultData);
    };
  }, [reset, defaultData]);

  const UnsavedChangesAlertModal = useUnsavedChangesAlertModal(isDataDirty);

  return (
    <>
      <SignInMethodsForm />
      <UnsavedChangesAlertModal />
    </>
  );
};

export default SignInMethodsTab;
