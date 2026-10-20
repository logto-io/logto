import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderType } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import { useEffect, useMemo } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type ConsoleSsoConnector } from '@/cloud/types/router';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Select from '@/ds-components/Select';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import { SyncProfileMode } from '@/types/connector';
import { uriValidator } from '@/utils/validator';

import DomainManager from './DomainManager';
import styles from './index.module.scss';

type ConsoleSsoBranding = ConsoleSsoConnector['branding'] & {
  showBeforeEmailMatch?: boolean;
};

type ConsoleSsoConnectorData = Omit<ConsoleSsoConnector, 'branding'> & {
  branding: ConsoleSsoBranding;
};

type Props = {
  readonly data: ConsoleSsoConnectorData;
  readonly isDeleted: boolean;
  readonly onUpdated: () => Promise<void>;
};

type FormType = {
  branding: {
    displayName: string;
    logo: string;
    darkLogo: string;
    showBeforeEmailMatch: boolean;
  };
  syncProfile: SyncProfileMode;
  enableTokenStorage: boolean;
};

const dataToForm = (
  data: Pick<ConsoleSsoConnectorData, 'branding' | 'syncProfile' | 'enableTokenStorage'>
): FormType => ({
  branding: {
    displayName: data.branding.displayName ?? '',
    logo: data.branding.logo ?? '',
    darkLogo: data.branding.darkLogo ?? '',
    showBeforeEmailMatch: data.branding.showBeforeEmailMatch ?? true,
  },
  syncProfile: data.syncProfile ? SyncProfileMode.EachSignIn : SyncProfileMode.OnlyAtRegister,
  enableTokenStorage: data.enableTokenStorage,
});

function Experience({ data, isDeleted, onUpdated }: Props) {
  const { branding, syncProfile, enableTokenStorage } = data;
  const { displayName, logo, darkLogo, showBeforeEmailMatch } = branding;
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const methods = useForm<FormType>({ defaultValues: dataToForm(data) });
  const {
    control,
    formState: { isDirty, isSubmitting, errors },
    handleSubmit,
    register,
    reset,
  } = methods;
  const syncProfileOptions = useMemo(
    () => [
      {
        value: SyncProfileMode.OnlyAtRegister,
        title: t('enterprise_sso_details.sync_profile_option.register_only'),
      },
      {
        value: SyncProfileMode.EachSignIn,
        title: t('enterprise_sso_details.sync_profile_option.each_sign_in'),
      },
    ],
    [t]
  );

  const formValues = useMemo(
    () =>
      dataToForm({
        branding: { displayName, logo, darkLogo, showBeforeEmailMatch },
        syncProfile,
        enableTokenStorage,
      }),
    [displayName, logo, darkLogo, showBeforeEmailMatch, syncProfile, enableTokenStorage]
  );

  useEffect(() => {
    reset(formValues);
  }, [formValues, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    const brandingPayload = cleanDeep(formData.branding, { emptyObjects: false });

    try {
      const updated = await api.patch('/api/me/console-sso/connectors/:connectorId', {
        params: { connectorId: data.id },
        body: {
          branding: brandingPayload,
          syncProfile: formData.syncProfile === SyncProfileMode.EachSignIn,
          ...(data.providerType === SsoProviderType.OIDC && {
            enableTokenStorage: formData.enableTokenStorage,
          }),
        },
      });
      reset(dataToForm(updated));
      toast.success(t('general.saved'));
      await onUpdated();
    } catch (error) {
      await onUpdated();
      await toastResponseError(error);
    }
  });

  return (
    <FormProvider {...methods}>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="enterprise_sso_details.general_settings_title"
          description="enterprise_sso_details.general_settings_description"
        >
          <FormField title="enterprise_sso_details.connector_name_field_name">
            <CopyToClipboard displayType="block" variant="border" value={data.connectorName} />
          </FormField>
          <DomainManager data={data} onUpdated={onUpdated} />
          <FormField title="enterprise_sso_details.sync_profile_field_name">
            <Controller
              name="syncProfile"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Select options={syncProfileOptions} value={value} onChange={onChange} />
              )}
            />
          </FormField>
          {data.providerType === SsoProviderType.OIDC && (
            <div className={styles.tokenStorage}>
              <Controller
                name="enableTokenStorage"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    description="connectors.guide.enable_token_storage.title"
                    aria-label={t('connectors.guide.enable_token_storage.title')}
                    checked={value}
                    onChange={({ currentTarget }) => {
                      onChange(currentTarget.checked);
                    }}
                  />
                )}
              />
            </div>
          )}
        </FormCard>
        <FormCard
          title="enterprise_sso_details.custom_branding_title"
          description="enterprise_sso_details.custom_branding_description"
        >
          <InlineNotification severity="alert">
            {t('enterprise_sso_details.custom_branding_visibility_notice')}
          </InlineNotification>
          <FormField title="enterprise_sso_details.show_before_email_match_field_name">
            <Controller
              name="branding.showBeforeEmailMatch"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  aria-label={t('enterprise_sso_details.show_before_email_match_field_name')}
                  description="enterprise_sso_details.show_before_email_match_description"
                  checked={value}
                  onChange={({ currentTarget }) => {
                    onChange(currentTarget.checked);
                  }}
                />
              )}
            />
          </FormField>
          <FormField title="enterprise_sso_details.display_name_field_name">
            <TextInput {...register('branding.displayName')} placeholder={data.name} />
          </FormField>
          <FormField title="enterprise_sso_details.branding_logo_field_name">
            <TextInput
              {...register('branding.logo', {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              error={errors.branding?.logo?.message}
              placeholder={t('enterprise_sso_details.branding_logo_field_placeholder')}
            />
          </FormField>
          <FormField title="enterprise_sso_details.branding_dark_logo_field_name">
            <TextInput
              {...register('branding.darkLogo', {
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              error={errors.branding?.darkLogo?.message}
              placeholder={t('enterprise_sso_details.branding_dark_logo_field_placeholder')}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

export default Experience;
