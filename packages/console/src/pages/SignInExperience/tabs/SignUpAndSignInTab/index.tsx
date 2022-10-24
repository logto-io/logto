import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import type { SignInExperienceForm } from '../../types';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

type Props = {
  defaultData: SignInExperienceForm;
  isDataDirty: boolean;
};

const SignUpAndSignInTab = ({ defaultData, isDataDirty }: Props) => {
  const { reset } = useFormContext<SignInExperienceForm>();

  useEffect(() => {
    return () => {
      reset(defaultData);
    };
  }, [reset, defaultData]);

  return (
    <>
      <SignUpForm />
      <SignInForm />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDataDirty} />
    </>
  );
};

export default SignUpAndSignInTab;
