import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import BrandingForm from '../components/BrandingForm';
import ColorForm from '../components/ColorForm';
import type { SignInExperienceForm } from '../types';

type Props = {
  defaultData: SignInExperienceForm;
  isDataDirty: boolean;
};

const BrandingTab = ({ defaultData, isDataDirty }: Props) => {
  const { reset } = useFormContext<SignInExperienceForm>();

  useEffect(() => {
    return () => {
      reset(defaultData);
    };
  }, [reset, defaultData]);

  return (
    <>
      <ColorForm />
      <BrandingForm />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDataDirty} />
    </>
  );
};

export default BrandingTab;
