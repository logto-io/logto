import { customClientMetadataDefault, customClientMetadataGuard } from '@logto/schemas';
import { get, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField, { type Props as FormFieldProps } from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

const { minValue, maxValue } = customClientMetadataGuard.shape.refreshTokenTtlInDays._def.innerType;
const minTtl = minValue ?? Number.NEGATIVE_INFINITY;
const maxTtl = maxValue ?? Number.POSITIVE_INFINITY;

type Props<T extends FieldValues> = {
  /** The form field path of the TTL in days, which differs between form shapes. */
  readonly name: FieldPath<T>;
  readonly isRequired?: boolean;
  readonly tip?: FormFieldProps['tip'];
};

/** The refresh token TTL input shared by registered application and dynamic app settings. */
function RefreshTokenTtlField<T extends FieldValues>({ name, isRequired, tip }: Props<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const ttlErrorMessage = t('errors.number_should_be_between_inclusive', {
    min: minTtl,
    max: maxTtl,
  });

  return (
    <FormField isRequired={isRequired} title="application_details.refresh_token_ttl" tip={tip}>
      <TextInput
        {...register(name, {
          required: isRequired && ttlErrorMessage,
          min: { value: minTtl, message: ttlErrorMessage },
          max: { value: maxTtl, message: ttlErrorMessage },
          valueAsNumber: true,
          validate: (value: unknown) =>
            value === undefined || Number.isInteger(value) || t('errors.should_be_an_integer'),
        })}
        placeholder={String(customClientMetadataDefault.refreshTokenTtlInDays)}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `get` resolves the nested error of a dynamic field path and is typed `any`
        error={get(errors, name)?.message}
      />
    </FormField>
  );
}

export default RefreshTokenTtlField;
