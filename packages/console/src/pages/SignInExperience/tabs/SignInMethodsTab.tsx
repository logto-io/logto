import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import SignInMethodsForm from '../components/SignInMethodsForm';
import type { SignInExperienceForm } from '../types';

type Props = {
  defaultData: SignInExperienceForm;
  isDataDirty: boolean;
};

const SignInMethodsTab = ({ defaultData, isDataDirty }: Props) => {
  const { reset } = useFormContext<SignInExperienceForm>();

  useEffect(() => {
    return () => {
      reset(defaultData);
    };
  }, [reset, defaultData]);

  return (
    <>
      <SignInMethodsForm />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDataDirty} />
    </>
  );
};

export default SignInMethodsTab;
