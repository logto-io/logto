import { cimdConfigGuard, customClientMetadataDefault } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import { type SettingsFormData } from './types';

const { minValue, maxValue } = cimdConfigGuard.shape.refreshTokenTtlInDays._def.innerType;
const minTtl = minValue ?? Number.NEGATIVE_INFINITY;
const maxTtl = maxValue ?? Number.POSITIVE_INFINITY;

function RefreshTokenSettings() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SettingsFormData>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const ttlErrorMessage = t('errors.number_should_be_between_inclusive', {
    min: minTtl,
    max: maxTtl,
  });

  return (
    <FormCard
      title="application_details.refresh_token_settings"
      description="application_details.refresh_token_settings_description"
    >
      <FormField isRequired title="application_details.refresh_token_ttl">
        <TextInput
          {...register('refreshTokenTtlInDays', {
            required: ttlErrorMessage,
            min: { value: minTtl, message: ttlErrorMessage },
            max: { value: maxTtl, message: ttlErrorMessage },
            valueAsNumber: true,
            validate: (value) => Number.isInteger(value) || t('errors.should_be_an_integer'),
          })}
          placeholder={String(customClientMetadataDefault.refreshTokenTtlInDays)}
          error={errors.refreshTokenTtlInDays?.message}
        />
      </FormField>
    </FormCard>
  );
}

export default RefreshTokenSettings;
