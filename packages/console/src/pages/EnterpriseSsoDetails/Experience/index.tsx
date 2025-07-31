/* eslint-disable max-lines */
import {
  type SsoConnector,
  type SsoConnectorWithProviderConfig,
  type RequestErrorBody,
  SsoProviderType,
} from '@logto/schemas';
import { generateStandardShortId } from '@logto/shared/universal';
import { conditional } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { HTTPError } from 'ky';
import { useMemo } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { retrieveTokenStorage, spInitiatedSsoFlow } from '@/consts';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Select from '@/ds-components/Select';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { SyncProfileMode } from '@/types/connector';
import { trySubmitSafe } from '@/utils/form';
import { uriValidator } from '@/utils/validator';

import DomainsInput, { type DomainsFormType } from './DomainsInput';
import {
  duplicatedDomainsErrorCode,
  forbiddenDomainsErrorCode,
  invalidDomainFormatErrorCode,
} from './DomainsInput/consts';
import { domainOptionsParser } from './DomainsInput/utils';
import LogosUploader from './LogosUploader';
import styles from './index.module.scss';

type DataType = Pick<
  SsoConnectorWithProviderConfig,
  | 'branding'
  | 'connectorName'
  | 'domains'
  | 'syncProfile'
  | 'id'
  | 'name'
  | 'enableTokenStorage'
  | 'providerType'
>;

type Props = {
  readonly isDeleted: boolean;
  readonly data: DataType;
  readonly onUpdated: (data: DataType) => void;
  readonly isDarkModeEnabled: boolean;
};

export type FormType = Pick<SsoConnector, 'branding' | 'connectorName'> &
  DomainsFormType & {
    syncProfile: SyncProfileMode;
    enableTokenStorage: boolean;
  };

const duplicateConnectorNameErrorCode = 'single_sign_on.duplicate_connector_name';

const dataToFormParser = (data: DataType) => {
  const { branding, connectorName, domains, syncProfile, enableTokenStorage, providerType } = data;
  return {
    // Fallback to the empty string to avoid expected `isDirty` status.
    // As input fields will automatically set undefined value to empty string.
    branding: {
      displayName: branding.displayName ?? '',
      logo: branding.logo ?? '',
      darkLogo: branding.darkLogo ?? '',
    },
    connectorName,
    domains: domains.map((domain) => ({ value: domain, id: generateStandardShortId() })),
    syncProfile: syncProfile ? SyncProfileMode.EachSignIn : SyncProfileMode.OnlyAtRegister,
    ...conditional(providerType === SsoProviderType.OIDC && { enableTokenStorage }),
  };
};

const formDataToSsoConnectorParser = (
  formData: FormType
): Pick<
  SsoConnector,
  'branding' | 'connectorName' | 'domains' | 'syncProfile' | 'enableTokenStorage'
> => {
  const { branding, connectorName, domains, syncProfile, enableTokenStorage } = formData;
  return {
    branding,
    connectorName,
    domains: domains.map(({ value }) => value),
    syncProfile: syncProfile === SyncProfileMode.EachSignIn,
    enableTokenStorage,
  };
};

function Experience({ data, isDeleted, onUpdated, isDarkModeEnabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isReady: isUserAssetsServiceReady } = useUserAssetsService();
  const api = useApi({ hideErrorToast: true });
  const { getDocumentationUrl } = useDocumentationUrl();

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
    []
  );

  const formMethods = useForm<FormType>({ defaultValues: dataToFormParser(data) });
  const {
    control,
    watch,
    setValue,
    setError,
    handleSubmit,
    register,
    formState: { defaultValues, isDirty, isSubmitting, errors },
    reset,
  } = formMethods;

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: FormType) => {
      if (isSubmitting) {
        return;
      }

      try {
        const updatedSsoConnector = await api
          // TODO: @darcyYe add console test case of clean up `branding` config.
          // Only keep non-empty values since PATCH operation performs a merge scheme.
          .patch(`api/sso-connectors/${data.id}`, {
            json: cleanDeep(formDataToSsoConnectorParser(formData), {
              // To overwrite the `branding` field, which is a JSONB typed column in DB.
              emptyObjects: false,
            }),
          })
          .json<SsoConnectorWithProviderConfig>();

        reset(dataToFormParser(updatedSsoConnector));
        toast.success(t('general.saved'));
        onUpdated(updatedSsoConnector);
      } catch (error: unknown) {
        if (error instanceof HTTPError) {
          const { response } = error;
          const metadata = await response.clone().json<RequestErrorBody<{ data: string[] }>>();

          /**
           * Should render invalid domains:
           * - show `error` tag for forbidden domains
           * - show `info` tag for duplicated domains
           *
           * Also manually passed the returned error message to `setError` to show the error message in-place.
           */
          if (
            [
              duplicatedDomainsErrorCode,
              forbiddenDomainsErrorCode,
              invalidDomainFormatErrorCode,
            ].includes(metadata.code)
          ) {
            setValue(
              'domains',
              watch('domains').map((domain) => ({
                ...domain,
                ...conditional(metadata.data.data.includes(domain.value) && { status: 'info' }),
              })),
              { shouldDirty: true }
            );
            setError('domains', { type: 'custom', message: metadata.message });
          }

          if (duplicateConnectorNameErrorCode === metadata.code) {
            setError('connectorName', { type: 'custom', message: metadata.message });
          }
        }
      }
    })
  );

  const isTokenStorageEnabled = watch('enableTokenStorage');

  return (
    <FormProvider {...formMethods}>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="enterprise_sso_details.general_settings_title"
          description="enterprise_sso_details.general_settings_description"
          learnMoreLink={{ href: spInitiatedSsoFlow }}
        >
          <FormField isRequired title="enterprise_sso_details.connector_name_field_name">
            <TextInput
              {...register('connectorName', { required: true })}
              error={errors.connectorName?.message}
            />
          </FormField>
          {!defaultValues?.domains?.length && (
            <InlineNotification className={styles.inlineNotification} severity="alert">
              {t('enterprise_sso_details.configure_domain_field_info_text')}
            </InlineNotification>
          )}
          <FormField isRequired title="enterprise_sso_details.email_domain_field_name">
            <Controller
              name="domains"
              control={control}
              rules={{
                validate: (value) => {
                  if (value.length === 0) {
                    return t('enterprise_sso_details.email_domain_field_required');
                  }
                  const { errorMessage } = domainOptionsParser(value);
                  if (errorMessage) {
                    return errorMessage;
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <DomainsInput
                  values={value}
                  // Per previous error handling on submitting, error message will be truthy.
                  error={errors.domains?.message}
                  placeholder="enterprise_sso_details.email_domain_field_placeholder"
                  onChange={onChange}
                />
              )}
            />
            <div className={styles.description}>
              {t('enterprise_sso_details.email_domain_field_description')}
            </div>
          </FormField>
          <FormField title="enterprise_sso_details.sync_profile_field_name">
            <Controller
              name="syncProfile"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <Select options={syncProfileOptions} value={value} onChange={onChange} />
              )}
            />
          </FormField>
          {data.providerType === SsoProviderType.OIDC && (
            <FormField title="connectors.guide.enable_token_storage.title">
              <Controller
                name="enableTokenStorage"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    label={
                      <Trans
                        components={{
                          a: (
                            <TextLink
                              href={getDocumentationUrl(retrieveTokenStorage)}
                              targetBlank="noopener"
                            />
                          ),
                        }}
                        i18nKey="admin_console.connectors.guide.enable_token_storage.description"
                      />
                    }
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          )}
        </FormCard>
        <FormCard
          title="enterprise_sso_details.custom_branding_title"
          description="enterprise_sso_details.custom_branding_description"
        >
          <FormField title="enterprise_sso_details.display_name_field_name">
            <TextInput
              {...register('branding.displayName')}
              placeholder={data.name}
              error={errors.branding?.displayName?.message}
            />
          </FormField>
          {isUserAssetsServiceReady ? (
            <FormField
              title="enterprise_sso_details.connector_logo_field_name"
              headlineSpacing="large"
            >
              <LogosUploader isDarkModeEnabled={isDarkModeEnabled} />
            </FormField>
          ) : (
            <>
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
            </>
          )}
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

export default Experience;
/* eslint-enable max-lines */
