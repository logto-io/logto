import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Switch from '@/components/Switch';
import TextInput from '@/components/TextInput';

import { SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const TermsForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, register } = useFormContext<SignInExperienceForm>();
  const enabled = watch('termsOfUse.enabled');

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.terms_of_use.title')}</div>
      <FormField title="admin_console.sign_in_exp.terms_of_use.enable">
        <Switch
          {...register('termsOfUse.enabled', { required: true })}
          label={t('sign_in_exp.terms_of_use.description')}
        />
      </FormField>
      <FormField
        isRequired={enabled}
        title="admin_console.sign_in_exp.terms_of_use.terms_of_use"
        tooltip="admin_console.sign_in_exp.terms_of_use.terms_of_use_tip"
      >
        <TextInput {...register('termsOfUse.contentUrl', { required: enabled })} />
      </FormField>
    </>
  );
};

export default TermsForm;
