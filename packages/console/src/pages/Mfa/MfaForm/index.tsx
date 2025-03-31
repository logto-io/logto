import {
  adminTenantId,
  MfaFactor,
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
  type SignInExperience,
} from '@logto/schemas';
import { useContext, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import InlineUpsell from '@/components/InlineUpsell';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { mfa } from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Select from '@/ds-components/Select';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';
import { isPaidPlan } from '@/utils/subscription';

import { type MfaConfigForm, type MfaConfig } from '../types';

import FactorLabel from './FactorLabel';
import UpsellNotice from './UpsellNotice';
import styles from './index.module.scss';
import { convertMfaFormToConfig, convertMfaConfigToForm, validateBackupCodeFactor } from './utils';

type Props = {
  readonly data: MfaConfig;
  readonly onMfaUpdated: (updatedData: MfaConfig) => void;
};

function MfaForm({ data, onMfaUpdated }: Props) {
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota,
    mutateSubscriptionQuotaAndUsages,
  } = useContext(SubscriptionDataContext);
  const { currentTenantId } = useContext(TenantsContext);

  const isMfaDisabled =
    isCloud && !currentSubscriptionQuota.mfaEnabled && !isPaidPlan(planId, isEnterprisePlan);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    reset,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    control,
    watch,
    setValue,
  } = useForm<MfaConfigForm>({ defaultValues: convertMfaConfigToForm(data), mode: 'onChange' });
  const api = useApi();

  const formValues = watch();

  const isBackupCodeAllowed = useMemo(() => {
    const { factors } = convertMfaFormToConfig(formValues);
    return validateBackupCodeFactor(factors);
  }, [formValues]);

  const isPolicySettingsDisabled = useMemo(() => {
    if (isMfaDisabled) {
      return true;
    }
    const { factors } = convertMfaFormToConfig(formValues);
    return factors.length === 0;
  }, [formValues, isMfaDisabled]);

  useEffect(() => {
    const { factors } = convertMfaFormToConfig(formValues);

    if (factors.length > 0) {
      return;
    }

    // Reset the `isMandatory` to false when there is no MFA factor
    if (formValues.isMandatory) {
      setValue('isMandatory', false);
    }

    // Reset the `setUpPrompt` to `NoPrompt` when there is no MFA factor
    if (formValues.setUpPrompt !== MfaPolicy.NoPrompt) {
      setValue('setUpPrompt', MfaPolicy.NoPrompt);
    }

    // Reset the `organizationRequiredMfaPolicy` to `NoPrompt` when there is no MFA factor
    if (formValues.organizationRequiredMfaPolicy !== OrganizationRequiredMfaPolicy.NoPrompt) {
      setValue('organizationRequiredMfaPolicy', OrganizationRequiredMfaPolicy.NoPrompt);
    }
  }, [formValues, setValue]);

  const mfaPolicyOptions = useMemo(
    () => [
      {
        value: MfaPolicy.NoPrompt,
        title: t('mfa.no_prompt'),
      },
      {
        value: MfaPolicy.PromptAtSignInAndSignUp,
        title: t('mfa.prompt_at_sign_in_and_sign_up'),
      },
      {
        value: MfaPolicy.PromptOnlyAtSignIn,
        title: t('mfa.prompt_only_at_sign_in'),
      },
    ],
    [t]
  );

  const organizationEnabledMfaPolicyOptions = useMemo(
    () => [
      {
        value: OrganizationRequiredMfaPolicy.NoPrompt,
        title: t('mfa.no_prompt'),
      },
      {
        value: OrganizationRequiredMfaPolicy.Mandatory,
        title: t('mfa.prompt_at_sign_in_no_skip'),
      },
    ],
    [t]
  );

  // Only show the organization MFA policy config for the admin tenant
  const showOrganizationMfaPolicyConfig = useMemo(
    () => isDevFeaturesEnabled || (isCloud && currentTenantId === adminTenantId),
    [currentTenantId]
  );

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      const mfaConfig = convertMfaFormToConfig(formData, showOrganizationMfaPolicyConfig);
      if (!validateBackupCodeFactor(mfaConfig.factors)) {
        return;
      }

      const { mfa: updatedMfaConfig } = await api
        .patch('api/sign-in-exp', {
          json: { mfa: mfaConfig },
        })
        .json<SignInExperience>();
      mutateSubscriptionQuotaAndUsages();
      reset(convertMfaConfigToForm(updatedMfaConfig));
      toast.success(t('general.saved'));
      onMfaUpdated(updatedMfaConfig);
    })
  );

  return (
    <>
      <UpsellNotice className={styles.upsellNotice} />
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onDiscard={reset}
      >
        <FormCard
          title="mfa.factors"
          description="mfa.multi_factors_description"
          learnMoreLink={{ href: mfa }}
        >
          <FormField title="mfa.multi_factors" headlineSpacing="large">
            <div className={styles.factorField}>
              <Switch
                disabled={isMfaDisabled}
                label={<FactorLabel type={MfaFactor.TOTP} />}
                {...register('totpEnabled')}
              />
              <Switch
                disabled={isMfaDisabled}
                label={<FactorLabel type={MfaFactor.WebAuthn} />}
                {...register('webAuthnEnabled')}
              />
              <div className={styles.backupCodeField}>
                <div className={styles.backupCodeDescription}>
                  <DynamicT forKey="mfa.backup_code_setup_hint" />
                </div>
                <Switch
                  disabled={isMfaDisabled}
                  label={<FactorLabel type={MfaFactor.BackupCode} />}
                  hasError={!isBackupCodeAllowed}
                  {...register('backupCodeEnabled')}
                />
                {!isBackupCodeAllowed && (
                  <InlineNotification>
                    <DynamicT forKey="mfa.backup_code_error_hint" />
                  </InlineNotification>
                )}
              </div>
            </div>
          </FormField>
          {isMfaDisabled && (
            <InlineUpsell
              for="mfa"
              className={styles.unlockMfaNotice}
              actionButtonText="upsell.view_plans"
            />
          )}
        </FormCard>
        <FormCard
          title="mfa.policy"
          description="mfa.policy_description"
          learnMoreLink={{ href: mfa }}
        >
          <FormField title="mfa.require_mfa" headlineSpacing="large">
            <Switch
              disabled={isPolicySettingsDisabled}
              label={t('mfa.require_mfa_label')}
              {...register('isMandatory')}
            />
          </FormField>
          {!formValues.isMandatory && (
            <FormField title="mfa.set_up_prompt" headlineSpacing="large">
              <Controller
                control={control}
                name="setUpPrompt"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    options={mfaPolicyOptions}
                    isReadOnly={isPolicySettingsDisabled}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
          )}
          {!formValues.isMandatory && showOrganizationMfaPolicyConfig && (
            <FormField title="mfa.set_up_organization_required_mfa_prompt" headlineSpacing="large">
              <Controller
                control={control}
                name="organizationRequiredMfaPolicy"
                render={({ field: { onChange, value } }) => (
                  <Select
                    // Fallback to `NoPrompt` if the value is not set
                    value={value ?? OrganizationRequiredMfaPolicy.NoPrompt}
                    options={organizationEnabledMfaPolicyOptions}
                    isReadOnly={isPolicySettingsDisabled}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
          )}
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
}

export default MfaForm;
