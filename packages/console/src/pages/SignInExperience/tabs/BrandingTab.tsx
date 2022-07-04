import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { useUnsavedChangesAlertModal } from '@/hooks/use-unsaved-changes-alert-modal';

import BrandingForm from '../components/BrandingForm';
import ColorForm from '../components/ColorForm';
import { SignInExperienceForm } from '../types';

type Props = {
  defaultData: SignInExperienceForm;
  isDataDirty: boolean;
};

const BrandingTab = ({ defaultData, isDataDirty }: Props) => {
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
      <ColorForm />
      <BrandingForm />
      <UnsavedChangesAlertModal />
    </>
  );
};

export default BrandingTab;
