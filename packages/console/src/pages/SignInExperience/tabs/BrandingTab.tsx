import { useFormContext } from 'react-hook-form';

import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import BrandingForm from '../components/BrandingForm';
import ColorForm from '../components/ColorForm';
import type { SignInExperienceForm } from '../types';

const BrandingTab = () => {
  const {
    formState: { isDirty },
  } = useFormContext<SignInExperienceForm>();

  return (
    <>
      <ColorForm />
      <BrandingForm />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
};

export default BrandingTab;
