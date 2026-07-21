import { isEmailBlocklistItem } from '@logto/core-kit';
import { type SignInExperience } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
import InlineNotification from '@/ds-components/InlineNotification';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';
import usePaywall from '@/hooks/use-paywall';
import { trySubmitSafe } from '@/utils/form';

import PaywallNotification from '../../PaywallNotification';
import {
  defaultBlockListPolicy,
  getEmailAllowlistWarnings,
  type EmailBlocklistPolicyFormData,
} from '../utils';

import styles from './index.module.scss';

type Props = {
  readonly formData: EmailBlocklistPolicyFormData;
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
  } = useForm<EmailBlocklistPolicyFormData>({
    defaultValues: formData,
  });
  const watchedFormData = useWatch({ control });
  const emailAllowlistWarnings = useMemo(
    () => getEmailAllowlistWarnings(watchedFormData),
    [watchedFormData]
  );

  const onSubmit = handleSubmit(
    trySubmitSafe(async (emailBlocklistPolicy: EmailBlocklistPolicyFormData) => {
      if (isSubmitting) {
        return;
      }

      const { emailBlocklistPolicy: updatedEmailBlocklistPolicy } = await api
        .patch('api/sign-in-exp', {
          json: {
            emailBlocklistPolicy,
          },
        })
        .json<SignInExperience>();

      // Reset the form with the updated data
      reset({
        ...defaultBlockListPolicy,
        ...updatedEmailBlocklistPolicy,
      });
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

                    if (!isEmailBlocklistItem(input)) {
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
          <FormField title="security.blocklist.custom_email_allowlist.title">
            <div className={styles.fieldDescription}>
              {t('blocklist.custom_email_allowlist.description')}
            </div>
            <Controller
              name="customAllowlist"
              control={control}
              render={({ field: { onChange, value = [] } }) => (
                <MultiOptionInput
                  disabled={isFreeTenant}
                  values={value}
                  placeholder={t('blocklist.custom_email_allowlist.placeholder')}
                  renderValue={(value) => value}
                  validateInput={(input) => {
                    if (
                      value.some(
                        (existingValue) => existingValue.toLowerCase() === input.toLowerCase()
                      )
                    ) {
                      return t('blocklist.custom_email_allowlist.duplicate_error');
                    }

                    if (!isEmailBlocklistItem(input)) {
                      return t('blocklist.custom_email_allowlist.invalid_format_error');
                    }

                    return { value: input };
                  }}
                  error={errors.customAllowlist?.message}
                  onChange={onChange}
                  onError={(error) => {
                    setError('customAllowlist', { type: 'custom', message: error });
                  }}
                  onClearError={() => {
                    clearErrors('customAllowlist');
                  }}
                />
              )}
            />
            {emailAllowlistWarnings.length > 0 && (
              <InlineNotification className={styles.allowlistWarning} severity="alert">
                <ul className={styles.warningList}>
                  {emailAllowlistWarnings.map((warning) => (
                    <li key={warning}>
                      {t(`blocklist.custom_email_allowlist.warnings.${warning}`)}
                    </li>
                  ))}
                </ul>
              </InlineNotification>
            )}
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
}

export default BlocklistForm;
