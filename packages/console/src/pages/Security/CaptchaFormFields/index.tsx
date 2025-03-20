import { type UseFormRegister, type FieldErrors } from 'react-hook-form';

import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import { type CaptchaProviderMetadata } from '../CreateCaptchaForm/types';
import { type CaptchaFormType } from '../types';

type Props = {
  readonly metadata: CaptchaProviderMetadata;
  readonly errors: FieldErrors;
  readonly register: UseFormRegister<CaptchaFormType>;
};

function CaptchaFormFields({ metadata, errors, register }: Props) {
  return (
    <>
      {metadata.requiredFields.includes('siteKey') && (
        <FormField title="security.captcha_details.site_key">
          <TextInput error={Boolean(errors.siteKey)} {...register('siteKey', { required: true })} />
        </FormField>
      )}
      {metadata.requiredFields.includes('secretKey') && (
        <FormField title="security.captcha_details.secret_key">
          <TextInput
            error={Boolean(errors.secretKey)}
            {...register('secretKey', { required: true })}
          />
        </FormField>
      )}
      {metadata.requiredFields.includes('projectId') && (
        <FormField title="security.captcha_details.project_id">
          <TextInput
            error={Boolean(errors.projectId)}
            {...register('projectId', { required: true })}
          />
        </FormField>
      )}
    </>
  );
}

export default CaptchaFormFields;
