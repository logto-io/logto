import { emailRegEx } from '@logto/core-kit';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import { type SignInExperienceForm } from '@/pages/SignInExperience/types';
import { uriValidator } from '@/utils/validator';

import FormFieldDescription from '../../components/FormFieldDescription';
import FormSectionTitle from '../../components/FormSectionTitle';

function SupportForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<SignInExperienceForm>();

  return (
    <Card>
      <FormSectionTitle title="content.support.title" />
      <FormFieldDescription>{t('sign_in_exp.content.support.subtitle')}</FormFieldDescription>
      <FormField title="sign_in_exp.content.support.support_email">
        <TextInput
          {...register('supportEmail', {
            pattern: { value: emailRegEx, message: t('errors.email_pattern_error') },
          })}
          error={errors.supportEmail?.message}
          placeholder={t('sign_in_exp.content.support.support_email_placeholder')}
        />
      </FormField>
      <FormField title="sign_in_exp.content.support.support_website">
        <TextInput
          {...register('supportWebsiteUrl', {
            validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
          })}
          error={errors.supportWebsiteUrl?.message}
          placeholder={t('sign_in_exp.content.support.support_website_placeholder')}
        />
      </FormField>
    </Card>
  );
}

export default SupportForm;
