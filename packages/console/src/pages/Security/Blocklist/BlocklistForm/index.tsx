import { emailOrEmailDomainRegEx } from '@logto/core-kit';
import { type SignInExperience, type EmailBlocklistPolicy } from '@logto/schemas';
import { useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import DetailsForm from '@/components/DetailsForm';
import { CombinedAddOnAndFeatureTag, addOnLabels } from '@/components/FeatureTag';
import FormCard from '@/components/FormCard';
import MultiOptionInput from '@/components/MultiOptionInput';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { emailBlocklist } from '@/consts';
import { isCloud } from '@/consts/env';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';
import usePaywall from '@/hooks/use-paywall';
import { trySubmitSafe } from '@/utils/form';

import PaywallNotification from '../../PaywallNotification';

import styles from './index.module.scss';

type Props = {
  readonly formData: EmailBlocklistPolicy;
};

function BlocklistForm({ formData }: Props) {
  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { isFreeTenant } = usePaywall();
  const { mutateSubscriptionQuotaAndUsages } = useContext(SubscriptionDataContext);

  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.security',
  });

  const { t: globalT } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const {
    reset,
    register,
    handleSubmit,
    setError,
    clearErrors,
    control,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<EmailBlocklistPolicy>({
    defaultValues: formData,
  });

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: EmailBlocklistPolicy) => {
      if (isSubmitting) {
        return;
      }

      const { emailBlocklistPolicy } = await api
        .patch('api/sign-in-exp', {
          json: {
            emailBlocklistPolicy: formData,
          },
        })
        .json<SignInExperience>();

      // Reset the form with the updated data
      reset(emailBlocklistPolicy);
      // Global mutate the SIE data
      await mutateGlobal('api/sign-in-exp');
      mutateSubscriptionQuotaAndUsages();
      toast.success(globalT('general.saved'));
    })
  );

  return (
    <>
      <PaywallNotification className={styles.paywallNotification} />
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onDiscard={reset}
      >
        <FormCard
          title="security.blocklist.card_title"
          description="security.blocklist.card_description"
          tag={
            <CombinedAddOnAndFeatureTag
              hasAddOnTag
              paywall={latestProPlanId}
              addOnLabel={addOnLabels.addOnBundle}
            />
          }
          learnMoreLink={{ href: emailBlocklist }}
        >
          {isCloud && (
            <FormField title="security.blocklist.disposable_email.title">
              <Switch
                disabled={isFreeTenant}
                label={t('blocklist.disposable_email.description')}
                {...register('blockDisposableAddresses')}
              />
            </FormField>
          )}
          <FormField title="security.blocklist.email_subaddressing.title">
            <Switch
              disabled={isFreeTenant}
              label={t('blocklist.email_subaddressing.description')}
              {...register('blockSubaddressing')}
            />
          </FormField>
          <FormField title="security.blocklist.custom_email_address.title">
            <div className={styles.fieldDescription}>
              {t('blocklist.custom_email_address.description')}
            </div>
            <Controller
              name="customBlocklist"
              control={control}
              render={({ field: { onChange, value = [] } }) => (
                <MultiOptionInput
                  disabled={isFreeTenant}
                  values={value}
                  placeholder={t('blocklist.custom_email_address.placeholder')}
                  renderValue={(value) => value}
                  validateInput={(input) => {
                    if (value.includes(input)) {
                      return t('blocklist.custom_email_address.duplicate_error');
                    }

                    if (!emailOrEmailDomainRegEx.test(input)) {
                      return t('blocklist.custom_email_address.invalid_format_error');
                    }

                    return { value: input };
                  }}
                  error={errors.customBlocklist?.message}
                  onChange={onChange}
                  onError={(error) => {
                    setError('customBlocklist', { type: 'custom', message: error });
                  }}
                  onClearError={() => {
                    clearErrors('customBlocklist');
                  }}
                />
              )}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
}

export default BlocklistForm;
