import { type Optional } from '@silverhand/essentials';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import styles from './index.module.scss';
import { type ApplicationForm } from './utils';

function ConcurrentDeviceLimit() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationForm>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard
      title="application_details.concurrent_device_limit.title"
      description="application_details.concurrent_device_limit.description"
    >
      <FormField title="application_details.concurrent_device_limit.field">
        <div className={styles.concurrentDeviceLimitDescription}>
          {t('application_details.concurrent_device_limit.field_description')}
        </div>
        <TextInput
          type="number"
          placeholder={t('application_details.concurrent_device_limit.field_placeholder')}
          error={errors.customClientMetadata?.maxAllowedGrants?.message}
          {...register('customClientMetadata.maxAllowedGrants', {
            setValueAs: (rawValue: Optional<string>) => {
              // Return undefined if the input is empty to allow clearing the value,
              // otherwise convert to number if it's a valid numeric string or NaN if it's not a valid number
              if (!rawValue) {
                return;
              }

              return /^\d+$/.test(rawValue) ? Number(rawValue) : Number.NaN;
            },
            validate: (value) => {
              if (value === undefined) {
                return true;
              }

              if (Number.isNaN(value) || !Number.isInteger(value)) {
                return t('errors.should_be_an_integer');
              }

              return (
                value > 0 ||
                t('application_details.concurrent_device_limit.should_be_greater_than_zero')
              );
            },
          })}
        />
      </FormField>
    </FormCard>
  );
}

export default ConcurrentDeviceLimit;
