import { type SignInExperience } from '@logto/schemas';
import { useContext, useState, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import UnlockIcon from '@/assets/icons/unlock.svg?react';
import DetailsForm from '@/components/DetailsForm';
import { addOnLabels, CombinedAddOnAndFeatureTag } from '@/components/FeatureTag';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { sentinel } from '@/consts';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import useApi from '@/hooks/use-api';
import usePaywall from '@/hooks/use-paywall';
import { trySubmitSafe } from '@/utils/form';

import PaywallNotification from '../../PaywallNotification';
import SentinelUnlockModal from '../SentinelUnlockModal';
import { generalFormParser, type GeneralFormData } from '../use-data-fetch';

import styles from './index.module.scss';

type Props = {
  readonly formData: GeneralFormData;
};

function GeneralForm({ formData }: Props) {
  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const { isFreeTenant } = usePaywall();
  const { mutateSubscriptionQuotaAndUsages } = useContext(SubscriptionDataContext);

  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.security',
  });

  const { t: globalT } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const {
    watch,
    control,
    register,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<GeneralFormData>({
    defaultValues: formData,
  });

  const sentinelPolicyEnabled = watch('sentinelPolicyEnabled');
  const verificationCodePolicyEnabled = watch('verificationCodePolicyEnabled');

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: GeneralFormData) => {
      if (isSubmitting) {
        return;
      }

      const updatedData = await api
        .patch('api/sign-in-exp', {
          json: generalFormParser.toSignInExperience(formData),
        })
        .json<SignInExperience>();

      // Reset the form with the updated data
      reset(generalFormParser.fromSignInExperience(updatedData));

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
          title="security.sentinel_policy.card_title"
          description="security.sentinel_policy.card_description"
          learnMoreLink={{ href: sentinel }}
          tag={
            <CombinedAddOnAndFeatureTag
              hasAddOnTag
              paywall={latestProPlanId}
              addOnLabel={addOnLabels.addOnBundle}
            />
          }
        >
          <FormField title="security.sentinel_policy.enable_sentinel_policy.title">
            <Switch
              disabled={isFreeTenant}
              label={t('sentinel_policy.enable_sentinel_policy.description')}
              {...register('sentinelPolicyEnabled')}
            />
          </FormField>
          {sentinelPolicyEnabled && (
            <>
              <FormField title="security.sentinel_policy.max_attempts.title">
                <div className={styles.fieldDescription}>
                  {t('sentinel_policy.max_attempts.description')}
                </div>
                <Controller
                  name="sentinelPolicy.maxAttempts"
                  control={control}
                  rules={{
                    min: 1,
                  }}
                  render={({ field: { onChange, value, name } }) => (
                    <NumericInput
                      className={styles.numericInput}
                      name={name}
                      value={String(value)}
                      min={1}
                      error={
                        errors.sentinelPolicy?.maxAttempts &&
                        t('sentinel_policy.max_attempts.error_message')
                      }
                      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                        onChange(value && Number(value));
                      }}
                      onValueUp={() => {
                        onChange(value + 1);
                      }}
                      onValueDown={() => {
                        onChange(value - 1);
                      }}
                    />
                  )}
                />
              </FormField>
              <FormField title="security.sentinel_policy.lockout_duration.title">
                <div className={styles.fieldDescription}>
                  {t('sentinel_policy.lockout_duration.description')}
                </div>
                <Controller
                  name="sentinelPolicy.lockoutDuration"
                  control={control}
                  rules={{
                    min: 1,
                  }}
                  render={({ field: { onChange, value, name } }) => (
                    <NumericInput
                      className={styles.numericInput}
                      name={name}
                      value={String(value)}
                      min={1}
                      error={
                        errors.sentinelPolicy?.lockoutDuration &&
                        t('sentinel_policy.lockout_duration.error_message')
                      }
                      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                        onChange(value && Number(value));
                      }}
                      onValueUp={() => {
                        onChange(value + 1);
                      }}
                      onValueDown={() => {
                        onChange(value - 1);
                      }}
                    />
                  )}
                />
              </FormField>
              <FormField title="security.sentinel_policy.manual_unlock.title">
                <div className={styles.fieldDescription}>
                  {t('sentinel_policy.manual_unlock.description')}
                </div>
                <Button
                  title="security.sentinel_policy.manual_unlock.unblock_by_identifiers"
                  icon={<UnlockIcon />}
                  onClick={() => {
                    setShowUnlockModal(true);
                  }}
                />
              </FormField>
            </>
          )}
        </FormCard>
        <FormCard
          title="security.verification_code_policy.card_title"
          description="security.verification_code_policy.card_description"
        >
          <FormField title="security.verification_code_policy.enable.title">
            <Switch
              label={t('verification_code_policy.enable.description')}
              {...register('verificationCodePolicyEnabled')}
            />
          </FormField>
          {verificationCodePolicyEnabled && (
            <>
              <FormField title="security.verification_code_policy.expiration_duration.title">
                <div className={styles.fieldDescription}>
                  {t('verification_code_policy.expiration_duration.description')}
                </div>
                <Controller
                  name="verificationCodePolicy.expirationDuration"
                  control={control}
                  rules={{
                    min: 60,
                    max: 3600,
                  }}
                  render={({ field: { onChange, value, name } }) => (
                    <NumericInput
                      className={styles.numericInput}
                      name={name}
                      value={String(value)}
                      min={60}
                      max={3600}
                      error={
                        errors.verificationCodePolicy?.expirationDuration &&
                        t('verification_code_policy.expiration_duration.error_message')
                      }
                      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                        onChange(value === '' ? 60 : Number(value));
                      }}
                      onValueUp={() => {
                        onChange(Math.min(value + 60, 3600));
                      }}
                      onValueDown={() => {
                        onChange(Math.max(value - 60, 60));
                      }}
                    />
                  )}
                />
              </FormField>
              <FormField title="security.verification_code_policy.max_retry_attempts.title">
                <div className={styles.fieldDescription}>
                  {t('verification_code_policy.max_retry_attempts.description')}
                </div>
                <Controller
                  name="verificationCodePolicy.maxRetryAttempts"
                  control={control}
                  rules={{
                    min: 1,
                    max: 100,
                  }}
                  render={({ field: { onChange, value, name } }) => (
                    <NumericInput
                      className={styles.numericInput}
                      name={name}
                      value={String(value)}
                      min={1}
                      max={100}
                      error={
                        errors.verificationCodePolicy?.maxRetryAttempts &&
                        t('verification_code_policy.max_retry_attempts.error_message')
                      }
                      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                        onChange(value === '' ? 1 : Number(value));
                      }}
                      onValueUp={() => {
                        onChange(Math.min(value + 1, 100));
                      }}
                      onValueDown={() => {
                        onChange(Math.max(value - 1, 1));
                      }}
                    />
                  )}
                />
              </FormField>
            </>
          )}
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
      <SentinelUnlockModal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false);
        }}
      />
    </>
  );
}

export default GeneralForm;
