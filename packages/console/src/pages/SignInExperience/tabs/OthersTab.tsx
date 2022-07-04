import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { useUnsavedChangesAlertModal } from '@/hooks/use-unsaved-changes-alert-modal';

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
    reset(defaultData);

    return () => {
      reset(defaultData);
    };
  }, [reset, defaultData]);

  const UnsavedChangesAlertModal = useUnsavedChangesAlertModal(isDataDirty);

  return (
    <>
      <TermsForm />
      <LanguagesForm />
      <UnsavedChangesAlertModal />
    </>
  );
};

export default OthersTab;
