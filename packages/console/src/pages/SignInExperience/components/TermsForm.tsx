import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Switch from '@/components/Switch';
import TextInput from '@/components/TextInput';
import { uriValidator } from '@/utilities/validator';

import type { SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const TermsForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext<SignInExperienceForm>();
  const enabled = watch('termsOfUse.enabled');

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.terms_of_use.title')}</div>
      <FormField title="sign_in_exp.others.terms_of_use.enable">
        <Switch
          {...register('termsOfUse.enabled')}
          label={t('sign_in_exp.others.terms_of_use.description')}
        />
      </FormField>
      {enabled && (
        <FormField
          isRequired
          title="sign_in_exp.others.terms_of_use.terms_of_use"
          tooltip="sign_in_exp.others.terms_of_use.terms_of_use_tip"
        >
          <TextInput
            {...register('termsOfUse.contentUrl', {
              required: true,
              validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
            })}
            hasError={Boolean(errors.termsOfUse)}
            errorMessage={errors.termsOfUse?.contentUrl?.message}
            placeholder={t('sign_in_exp.others.terms_of_use.terms_of_use_placeholder')}
          />
        </FormField>
      )}
    </>
  );
};

export default TermsForm;
