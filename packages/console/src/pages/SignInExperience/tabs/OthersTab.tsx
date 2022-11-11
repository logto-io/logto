import { useFormContext } from 'react-hook-form';

import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import AuthenticationForm from '../components/AuthenticationForm';
import LanguagesForm from '../components/LanguagesForm';
import TermsForm from '../components/TermsForm';
import type { SignInExperienceForm } from '../types';

const OthersTab = () => {
  const {
    formState: { isDirty },
  } = useFormContext<SignInExperienceForm>();

  return (
    <>
      <TermsForm />
      <LanguagesForm isManageLanguageVisible />
      <AuthenticationForm />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
};

export default OthersTab;
