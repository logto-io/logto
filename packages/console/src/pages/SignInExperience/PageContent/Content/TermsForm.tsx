import { AgreeToTermsPolicy } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import TextInput from '@/ds-components/TextInput';
import { uriValidator } from '@/utils/validator';

import type { SignInExperienceForm } from '../../types';
import FormSectionTitle from '../components/FormSectionTitle';

const agreeToTermsPolicyOptions = [
  {
    value: AgreeToTermsPolicy.Automatic,
    title: <DynamicT forKey="sign_in_exp.content.terms_of_use.agree_policies.automatic" />,
  },
  {
    value: AgreeToTermsPolicy.ManualRegistrationOnly,
    title: (
      <DynamicT forKey="sign_in_exp.content.terms_of_use.agree_policies.manual_registration_only" />
    ),
  },
  {
    value: AgreeToTermsPolicy.Manual,
    title: <DynamicT forKey="sign_in_exp.content.terms_of_use.agree_policies.manual" />,
  },
];

function TermsForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<SignInExperienceForm>();

  return (
    <Card>
      <FormSectionTitle title="content.terms_of_use.title" />
      <FormField title="sign_in_exp.content.terms_of_use.terms_of_use">
        <TextInput
          {...register('termsOfUseUrl', {
            validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          error={errors.termsOfUseUrl?.message}
          placeholder={t('sign_in_exp.content.terms_of_use.terms_of_use_placeholder')}
        />
      </FormField>
      <FormField title="sign_in_exp.content.terms_of_use.privacy_policy">
        <TextInput
          {...register('privacyPolicyUrl', {
            validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          error={errors.termsOfUseUrl?.message}
          placeholder={t('sign_in_exp.content.terms_of_use.privacy_policy_placeholder')}
        />
      </FormField>
      <FormField title="sign_in_exp.content.terms_of_use.agree_to_terms">
        <Controller
          name="agreeToTermsPolicy"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Select options={agreeToTermsPolicyOptions} value={value} onChange={onChange} />
          )}
        />
      </FormField>
    </Card>
  );
}

export default TermsForm;
