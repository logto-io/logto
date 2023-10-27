import { MfaFactor, MfaPolicy, type SignInExperience } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import ContactUsPhraseLink from '@/components/ContactUsPhraseLink';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import { type MfaConfigForm, type MfaConfig } from '../types';

import FactorLabel from './FactorLabel';
import { policyOptionTitleMap } from './constants';
import * as styles from './index.module.scss';
import { convertMfaFormToConfig, convertMfaConfigToForm, validateBackupCodeFactor } from './utils';

type Props = {
  data: MfaConfig;
  onMfaUpdated: (updatedData: MfaConfig) => void;
};

function MfaForm({ data, onMfaUpdated }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const { navigate } = useTenantPathname();
  const isMfaDisabled = isCloud && !currentPlan?.quota.mfaEnabled;

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
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
      return false;
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
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onDiscard={reset}
      >
        <FormCard title="mfa.factors" description="mfa.multi_factors_description">
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
            <InlineNotification
              className={styles.unlockMfaNotice}
              action="mfa.view_plans"
              onClick={() => {
                navigate('/tenant-settings/subscription');
              }}
            >
              <Trans
                components={{
                  a: <ContactUsPhraseLink />,
                }}
              >
                {t('mfa.unlock_reminder')}
              </Trans>
            </InlineNotification>
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
