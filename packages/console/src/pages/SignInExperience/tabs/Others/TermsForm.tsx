import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/components/Card';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import { uriValidator } from '@/utils/validator';

import type { SignInExperienceForm } from '../../types';
import * as styles from '../index.module.scss';

const TermsForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
  } = useFormContext<SignInExperienceForm>();

  return (
    <Card>
      <div className={styles.title}>{t('sign_in_exp.others.terms_of_use.title')}</div>
      <FormField title="sign_in_exp.others.terms_of_use.terms_of_use">
        <TextInput
          {...register('termsOfUseUrl', {
            validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          hasError={Boolean(errors.termsOfUseUrl)}
          errorMessage={errors.termsOfUseUrl?.message}
          placeholder={t('sign_in_exp.others.terms_of_use.terms_of_use_placeholder')}
        />
      </FormField>
      <FormField title="sign_in_exp.others.terms_of_use.privacy_policy">
        <TextInput
          {...register('privacyPolicyUrl', {
            validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          hasError={Boolean(errors.termsOfUseUrl)}
          errorMessage={errors.termsOfUseUrl?.message}
          placeholder={t('sign_in_exp.others.terms_of_use.privacy_policy_placeholder')}
        />
      </FormField>
    </Card>
  );
};

export default TermsForm;
