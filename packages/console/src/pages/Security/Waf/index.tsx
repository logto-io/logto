import { defaultWafConfig, type WafConfig } from '@logto/schemas';
import { useEffect, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import NumericInput from '@/ds-components/TextInput/NumericInput';
import useConfigs from '@/hooks/use-configs';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import { trySubmitSafe } from '@/utils/form';

import styles from './index.module.scss';

const modeValues = ['off', 'report', 'block'] as const;

function Waf() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.security.waf' });
  const { t: globalT } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { configs, error, isLoading, mutate, updateConfigs } = useConfigs();
  const {
    access: { isReadOnly },
  } = useCurrentTenantScopes();
  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<WafConfig>({ defaultValues: configs?.waf ?? defaultWafConfig });

  useEffect(() => {
    if (configs?.waf && !isDirty) {
      reset(configs.waf);
    }
  }, [configs?.waf, isDirty, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (waf) => {
      if (isReadOnly || isSubmitting) {
        return;
      }

      await updateConfigs({ waf });
      reset(waf);
      toast.success(globalT('general.saved'));
    })
  );

  if (isLoading) {
    return <FormCardSkeleton formFieldCount={2} />;
  }

  if (error) {
    return <RequestDataError error={error} onRetry={mutate} />;
  }

  return (
    <div className={styles.content}>
      <PageMeta titleKey={['security.tabs.waf', 'security.page_title']} />
      <DetailsForm
        isDirty={isDirty && !isReadOnly}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onDiscard={reset}
      >
        <FormCard title="security.waf.title" description="security.waf.description">
          <FormField title="security.waf.mode.title">
            <Controller
              name="mode"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select
                  value={value}
                  isReadOnly={isReadOnly}
                  options={modeValues.map((mode) => ({ value: mode, title: t(`mode.${mode}`) }))}
                  onChange={(mode) => {
                    if (mode) {
                      onChange(mode);
                    }
                  }}
                />
              )}
            />
          </FormField>
          <FormField title="security.waf.max_request_target_length.title">
            <div>{t('max_request_target_length.description')}</div>
            <Controller
              name="maxRequestTargetLength"
              control={control}
              rules={{ min: 1024, max: 65_536 }}
              render={({ field: { value, onChange, name } }) => (
                <NumericInput
                  className={styles.numericInput}
                  name={name}
                  value={String(value)}
                  min={1024}
                  max={65_536}
                  readOnly={isReadOnly}
                  error={errors.maxRequestTargetLength && t('max_request_target_length.error')}
                  onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                    onChange(Number(value));
                  }}
                  onValueUp={() => {
                    onChange(Math.min(value + 1024, 65_536));
                  }}
                  onValueDown={() => {
                    onChange(Math.max(value - 1024, 1024));
                  }}
                />
              )}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </div>
  );
}

export default Waf;
