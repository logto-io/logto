import { SignInExperience } from '@logto/schemas';
import React from 'react';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';

import * as styles from './index.module.scss';

type Props = {
  register: UseFormRegister<SignInExperience>;
  watch: UseFormWatch<SignInExperience>;
};

const TermsForm = ({ register, watch }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const enabled = watch('termsOfUse.enabled');

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.terms_of_use.title')}</div>
      <FormField isRequired title="admin_console.sign_in_exp.terms_of_use.enable">
        <TextInput {...register('termsOfUse.enabled', { required: true })} />
        <div>{t('sign_in_exp.terms_of_use.description')}</div>
      </FormField>
      <FormField isRequired={enabled} title="admin_console.sign_in_exp.terms_of_use.terms_of_use">
        <TextInput {...register('termsOfUse.contentUrl', { required: enabled })} />
      </FormField>
    </>
  );
};

export default TermsForm;
