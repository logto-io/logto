import { MfaFactor, MfaPolicy, type SignInExperience } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import InlineUpsell from '@/components/InlineUpsell';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { trySubmitSafe } from '@/utils/form';

import { type MfaConfigForm, type MfaConfig } from '../types';

import FactorLabel from './FactorLabel';
import UpsellNotice from './UpsellNotice';
import { policyOptionTitleMap } from './constants';
import styles from './index.module.scss';
import { convertMfaFormToConfig, convertMfaConfigToForm, validateBackupCodeFactor } from './utils';

type Props = {
  readonly data: MfaConfig;
  readonly onMfaUpdated: (updatedData: MfaConfig) => void;
};

function MfaForm({ data, onMfaUpdated }: Props) {
  const { currentPlan, currentSubscriptionQuota } = useContext(SubscriptionDataContext);
  const isMfaDisabled =
    isCloud &&
    !(isDevFeaturesEnabled ? currentSubscriptionQuota.mfaEnabled : currentPlan.quota.mfaEnabled);

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    register,
    reset,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    control,
    watch,
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

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      const mfaConfig = convertMfaFormToConfig(formData);
      if (!validateBackupCodeFactor(mfaConfig.factors)) {
        return;
      }

      const { mfa: updatedMfaConfig } = await api
        .patch('api/sign-in-exp', {
          json: { mfa: mfaConfig },
        })
        .json<SignInExperience>();
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
          learnMoreLink={{
            href: getDocumentationUrl('/docs/recipes/multi-factor-auth/configure-mfa'),
            targetBlank: 'noopener',
          }}
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
        <FormCard title="mfa.policy">
          <FormField title="mfa.two_step_sign_in_policy" headlineSpacing="large">
            <Controller
              control={control}
              name="policy"
              render={({ field: { onChange, value, name } }) => (
                <RadioGroup name={name} value={value} onChange={onChange}>
                  {Object.values(MfaPolicy).map((policy) => {
                    const title = policyOptionTitleMap[policy];
                    return (
                      <Radio
                        key={policy}
                        isDisabled={isPolicySettingsDisabled}
                        title={title}
                        value={policy}
                      />
                    );
                  })}
                </RadioGroup>
              )}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
}

export default MfaForm;
