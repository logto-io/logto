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
  const siteKeyField = metadata.requiredFields.find((field) => field.field === 'siteKey');
  const secretKeyField = metadata.requiredFields.find((field) => field.field === 'secretKey');
  const projectIdField = metadata.requiredFields.find((field) => field.field === 'projectId');

  return (
    <>
      {siteKeyField && (
        <FormField isRequired title={siteKeyField.label}>
          <TextInput error={Boolean(errors.siteKey)} {...register('siteKey', { required: true })} />
        </FormField>
      )}
      {secretKeyField && (
        <FormField isRequired title={secretKeyField.label}>
          <TextInput
            error={Boolean(errors.secretKey)}
            {...register('secretKey', { required: true })}
          />
        </FormField>
      )}
      {projectIdField && (
        <FormField isRequired title={projectIdField.label}>
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
