import { maximumAuthenticationAgeInSecondsRange } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import type { AccountCenterFormValues } from '../../types';

import styles from './index.module.scss';

const secondsPerMinute = 60;
const minMaximumAuthenticationAgeInMinutes = Math.ceil(
  maximumAuthenticationAgeInSecondsRange.min / secondsPerMinute
);
const maxMaximumAuthenticationAgeInMinutes = Math.floor(
  maximumAuthenticationAgeInSecondsRange.max / secondsPerMinute
);

type Props = {
  readonly isAccountApiEnabled: boolean;
};

/**
 * How recent a user's authentication must be before Logto allows a sensitive account operation
 * through the Account API, including the step-up that Account Center starts when the current
 * sign-in is too old. A client can still ask for a stricter window with `max_age`.
 */
function RecentAuthenticationFormCard({ isAccountApiEnabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
  } = useFormContext<{ accountCenter: AccountCenterFormValues }>();

  const rangeErrorMessage = t('errors.number_should_be_between_inclusive', {
    min: minMaximumAuthenticationAgeInMinutes,
    max: maxMaximumAuthenticationAgeInMinutes,
  });

  return (
    <FormCard
      title="sign_in_exp.account_center.recent_authentication.title"
      description="sign_in_exp.account_center.recent_authentication.description"
    >
      <div className={styles.cardContent}>
        <FormField
          title="sign_in_exp.account_center.recent_authentication.maximum_authentication_age_in_minutes"
          tip={t(
            'sign_in_exp.account_center.recent_authentication.maximum_authentication_age_in_minutes_tip'
          )}
        >
          <TextInput
            {...register('accountCenter.maximumAuthenticationAgeInMinutes', {
              min: {
                value: minMaximumAuthenticationAgeInMinutes,
                message: rangeErrorMessage,
              },
              max: {
                value: maxMaximumAuthenticationAgeInMinutes,
                message: rangeErrorMessage,
              },
              valueAsNumber: true,
              validate: (value) => Number.isInteger(value) || t('errors.should_be_an_integer'),
            })}
            placeholder="10"
            disabled={!isAccountApiEnabled}
            error={errors.accountCenter?.maximumAuthenticationAgeInMinutes?.message}
          />
        </FormField>
      </div>
    </FormCard>
  );
}

export default RecentAuthenticationFormCard;
