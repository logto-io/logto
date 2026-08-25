import { type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';

import { type MfaConfigForm } from '../types';

import styles from './index.module.scss';

type Props = {
  readonly isDisabled: boolean;
  readonly isDurationDirty: boolean;
  readonly register: UseFormRegister<MfaConfigForm>;
  readonly errors: FieldErrors<MfaConfigForm>;
};

const durationRange = Object.freeze({ min: 1, max: 365 });

function TrustedDeviceSettings({ isDisabled, isDurationDirty, register, errors }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard title="mfa.trusted_device.title" description="mfa.trusted_device.description">
      <FormField title="mfa.trusted_device.enable_title" headlineSpacing="large">
        <Switch
          disabled={isDisabled}
          description="mfa.trusted_device.enable_description"
          {...register('trustedDeviceEnabled')}
        />
      </FormField>
      <FormField title="mfa.trusted_device.duration_title" headlineSpacing="large">
        <TextInput
          type="number"
          disabled={isDisabled}
          error={errors.trustedDeviceDurationDays?.message}
          {...register('trustedDeviceDurationDays', {
            valueAsNumber: true,
            validate: (value) =>
              (Number.isInteger(value) &&
                value >= durationRange.min &&
                value <= durationRange.max) ||
              t('mfa.trusted_device.duration_error', durationRange),
          })}
        />
      </FormField>
      {isDurationDirty && (
        <InlineNotification className={styles.trustedDeviceDurationNote}>
          {t('mfa.trusted_device.duration_note')}
        </InlineNotification>
      )}
    </FormCard>
  );
}

export default TrustedDeviceSettings;
