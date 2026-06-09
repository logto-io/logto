import { type ChangeEvent } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import NumericInput from '@/ds-components/TextInput/NumericInput';

import { type PasswordPolicyFormData } from '../../use-password-policy';
import styles from '../index.module.scss';

type Props = {
  readonly hasAvailableForgotPasswordMethod: boolean;
};

function PasswordExpirationCard({ hasAvailableForgotPasswordMethod }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.security.password_policy',
  });

  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<PasswordPolicyFormData>();

  const isEnabled = watch('isPasswordExpirationEnabled');

  return (
    <FormCard
      title="security.password_policy.password_expiration"
      description="security.password_policy.password_expiration_description"
    >
      <FormField
        title="security.password_policy.enable_password_expiration"
        tip={t('enable_password_expiration_tip')}
      >
        <Switch
          label={t('enable_password_expiration_description')}
          disabled={!hasAvailableForgotPasswordMethod && !isEnabled}
          {...register('isPasswordExpirationEnabled')}
        />
      </FormField>
      {isEnabled && (
        <FormField
          title="security.password_policy.expiration_period"
          tip={t('expiration_period_description')}
        >
          <Controller
            name="passwordExpirationDays"
            control={control}
            rules={{ min: 1 }}
            render={({ field: { onChange, value, name } }) => (
              <NumericInput
                className={styles.minLength}
                name={name}
                value={String(value)}
                min={1}
                error={errors.passwordExpirationDays && t('expiration_period_error')}
                onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                  onChange(value === '' ? 1 : Number(value));
                }}
                onValueUp={() => {
                  onChange(value + 1);
                }}
                onValueDown={() => {
                  onChange(value - 1);
                }}
                onBlur={() => {
                  if (value < 1) {
                    onChange(1);
                  }
                }}
              />
            )}
          />
        </FormField>
      )}
    </FormCard>
  );
}

export default PasswordExpirationCard;
