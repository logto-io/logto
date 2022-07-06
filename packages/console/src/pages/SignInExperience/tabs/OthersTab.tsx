import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import LanguagesForm from '../components/LanguagesForm';
import TermsForm from '../components/TermsForm';
import { SignInExperienceForm } from '../types';

type Props = {
  defaultData: SignInExperienceForm;
  isDataDirty: boolean;
};

const OthersTab = ({ defaultData, isDataDirty }: Props) => {
  const { reset } = useFormContext<SignInExperienceForm>();

  useEffect(() => {
    return () => {
      reset(defaultData);
    };
  }, [reset, defaultData]);

  return (
    <>
      <TermsForm />
      <LanguagesForm />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDataDirty} />
    </>
  );
};

export default OthersTab;
