import { type Organization } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import MultiOptionInput from '@/components/MultiOptionInput';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isDevFeaturesEnabled } from '@/consts/env';
import CodeEditor from '@/ds-components/CodeEditor';
import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import { domainRegExp } from '@/pages/EnterpriseSsoDetails/Experience/DomainsInput/consts';
import { trySubmitSafe } from '@/utils/form';

import { type OrganizationDetailsOutletContext } from '../types';

import * as styles from './index.module.scss';

type FormData = Partial<Omit<Organization, 'customData'> & { customData: string }> & {
  isJitEnabled: boolean;
  jitEmailDomains: string[];
};

const isJsonObject = (value: string) => {
  const parsed = trySafe<unknown>(() => JSON.parse(value));
  return Boolean(parsed && typeof parsed === 'object');
};

const normalizeData = (data: Organization, emailDomains: string[]): FormData => ({
  ...data,
  isJitEnabled: emailDomains.length > 0,
  jitEmailDomains: emailDomains,
  customData: JSON.stringify(data.customData, undefined, 2),
});

const assembleData = ({
  isJitEnabled,
  jitEmailDomains,
  customData,
  ...data
}: FormData): Partial<Organization> => ({
  ...data,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  customData: JSON.parse(customData ?? '{}'),
});

function Settings() {
  const { isDeleting, data, emailDomains, onUpdated } =
    useOutletContext<OrganizationDetailsOutletContext>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    setError,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: normalizeData(
      data,
      emailDomains.map(({ emailDomain }) => emailDomain)
    ),
  });
  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const emailDomains = data.isJitEnabled ? data.jitEmailDomains : [];
      const updatedData = await api
        .patch(`api/organizations/${data.id}`, {
          json: assembleData(data),
        })
        .json<Organization>();

      await api.put(`api/organizations/${data.id}/email-domains`, {
        json: { emailDomains },
      });

      reset(normalizeData(updatedData, emailDomains));
      toast.success(t('general.saved'));
      onUpdated(updatedData);
    })
  );

  return (
    <DetailsForm
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={reset}
      onSubmit={onSubmit}
    >
      <FormCard
        title="general.settings_nav"
        description="organization_details.settings_description"
      >
        <FormField isRequired title="general.name">
          <TextInput
            placeholder={t('organization_details.name_placeholder')}
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="general.description">
          <TextInput
            placeholder={t('organization_details.description_placeholder')}
            {...register('description')}
          />
        </FormField>
        <FormField
          title="organization_details.custom_data"
          tip={t('organization_details.custom_data_tip')}
        >
          <Controller
            name="customData"
            control={control}
            rules={{
              validate: (value) =>
                isJsonObject(value ?? '') ? true : t('organization_details.invalid_json_object'),
            }}
            render={({ field }) => (
              <CodeEditor language="json" {...field} error={errors.customData?.message} />
            )}
          />
        </FormField>
      </FormCard>
      {isDevFeaturesEnabled && (
        <FormCard
          title="organization_details.jit.title"
          description="organization_details.jit.description"
        >
          <FormField title="organization_details.jit.is_enabled_title">
            <Controller
              name="isJitEnabled"
              control={control}
              render={({ field }) => (
                <div className={styles.jitContent}>
                  <RadioGroup
                    name="isJitEnabled"
                    value={String(field.value)}
                    onChange={(value) => {
                      field.onChange(value === 'true');
                    }}
                  >
                    <Radio
                      value="false"
                      title="organization_details.jit.is_enabled_false_description"
                    />
                    <Radio
                      value="true"
                      title="organization_details.jit.is_enabled_true_description"
                    />
                  </RadioGroup>
                  {field.value && (
                    <Controller
                      name="jitEmailDomains"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <MultiOptionInput
                          className={styles.emailDomains}
                          values={value}
                          renderValue={(value) => value}
                          validateInput={(input) => {
                            if (!domainRegExp.test(input)) {
                              return t('organization_details.jit.invalid_domain');
                            }

                            if (value.includes(input)) {
                              return t('organization_details.jit.domain_already_added');
                            }

                            return { value: input };
                          }}
                          placeholder={t('organization_details.jit.email_domains_placeholder')}
                          error={errors.jitEmailDomains?.message}
                          onChange={onChange}
                          onError={(error) => {
                            setError('jitEmailDomains', { type: 'custom', message: error });
                          }}
                          onClearError={() => {
                            clearErrors('jitEmailDomains');
                          }}
                        />
                      )}
                    />
                  )}
                </div>
              )}
            />
          </FormField>
        </FormCard>
      )}
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </DetailsForm>
  );
}

export default Settings;
