import { MfaFactor, MfaPolicy, type SignInExperience } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import { type MfaConfigForm, type MfaConfig } from '../types';

import FactorLabel from './FactorLabel';
import PolicyOptionTitle from './PolicyOptionTitle';
import { policyOptionTitlePropsMap } from './constants';
import * as styles from './index.module.scss';
import { convertMfaFormToConfig, convertMfaConfigToForm, validateBackupCodeFactor } from './utils';

type Props = {
  data: MfaConfig;
  onMfaUpdated: (updatedData: MfaConfig) => void;
};

function MfaForm({ data, onMfaUpdated }: Props) {
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
        <FormCard title="mfa.factors">
          <FormField title="mfa.multi_factors">
            <div className={styles.fieldDescription}>
              <DynamicT forKey="mfa.multi_factors_description" />
            </div>
            <div className={styles.factorField}>
              <Switch label={<FactorLabel type={MfaFactor.TOTP} />} {...register('totpEnabled')} />
              <Switch
                label={<FactorLabel type={MfaFactor.WebAuthn} />}
                {...register('webAuthnEnabled')}
              />
              <div className={styles.backupCodeField}>
                <div className={classNames(styles.fieldDescription, styles.backupCodeDescription)}>
                  <DynamicT forKey="mfa.backup_code_setup_hint" />
                </div>
                <Switch
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
        </FormCard>
        <FormCard title="mfa.policy">
          <FormField title="mfa.two_step_sign_in_policy">
            <div className={styles.fieldDescription}>
              <DynamicT forKey="mfa.two_step_sign_in_policy_description" />
            </div>
            <Controller
              control={control}
              name="policy"
              render={({ field: { onChange, value, name } }) => (
                <RadioGroup name={name} value={value} onChange={onChange}>
                  {Object.values(MfaPolicy).map((policy) => {
                    const titleProps = policyOptionTitlePropsMap[policy];
                    return (
                      <Radio
                        key={policy}
                        className={styles.policyRadio}
                        title={<PolicyOptionTitle {...titleProps} />}
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
