import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import {
  maxSessionTtlInDays,
  minSessionTtlInDays,
  type SessionConfigFormData,
} from './use-session-config-form';

type Props = {
  readonly errorMessage?: string;
};

function SessionsFormCard({ errorMessage }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
  } = useFormContext<{ session: SessionConfigFormData }>();

  const ttlErrorMessage = t('errors.number_should_be_between_inclusive', {
    min: minSessionTtlInDays,
    max: maxSessionTtlInDays,
  });

  return (
    <FormCard
      title="oidc_configs.sessions_card_title"
      description="oidc_configs.sessions_card_description"
    >
      <FormField
        title="oidc_configs.session_max_ttl_in_days"
        tip={t('oidc_configs.session_max_ttl_in_days_tip')}
      >
        <TextInput
          {...register('session.ttlInDays', {
            min: {
              value: minSessionTtlInDays,
              message: ttlErrorMessage,
            },
            max: {
              value: maxSessionTtlInDays,
              message: ttlErrorMessage,
            },
            valueAsNumber: true,
            validate: (value) =>
              value === undefined || Number.isInteger(value) || t('errors.should_be_an_integer'),
          })}
          placeholder="14"
          error={errors.session?.ttlInDays?.message ?? errorMessage}
        />
      </FormField>
    </FormCard>
  );
}

export default SessionsFormCard;
