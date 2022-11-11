import { useFormContext } from 'react-hook-form';

import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import type { SignInExperienceForm } from '../../types';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import SocialSignInForm from './SocialSignInForm';

const SignUpAndSignInTab = () => {
  const {
    formState: { isDirty },
  } = useFormContext<SignInExperienceForm>();

  return (
    <>
      <SignUpForm />
      <SignInForm />
      <SocialSignInForm />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
};

export default SignUpAndSignInTab;
