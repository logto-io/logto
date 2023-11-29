import {
  type SsoConnector,
  type SsoConnectorWithProviderConfig,
  type RequestErrorBody,
  findDuplicatedOrBlockedEmailDomains,
} from '@logto/schemas';
import { generateStandardShortId } from '@logto/shared/universal';
import { conditional, conditionalArray, conditionalString } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { t as globalTranslate } from 'i18next';
import { HTTPError } from 'ky';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Select from '@/ds-components/Select';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { SyncProfileMode } from '@/types/connector';
import { trySubmitSafe } from '@/utils/form';
import { uriValidator } from '@/utils/validator';

import LogosUploader from './LogosUploader';
import MultiInput, { type Option as MultiInputOption, domainRegExp } from './MultiInput';
import * as styles from './index.module.scss';

type DataType = Pick<
  SsoConnectorWithProviderConfig,
  'branding' | 'connectorName' | 'domains' | 'syncProfile' | 'id'
>;

type Props = {
  isDeleted: boolean;
  data: DataType;
  onUpdated: (data: DataType) => void;
};

export type FormType = Pick<SsoConnector, 'branding' | 'connectorName'> & {
  syncProfile: SyncProfileMode;
  domains: MultiInputOption[];
};

const duplicatedDomainsErrorCode = 'single_sign_on.duplicated_domains';
const forbiddenDomainsErrorCode = 'single_sign_on.forbidden_domains';
const invalidDomainFormatErrorCode = 'single_sign_on.invalid_domain_format';

const duplicateConnectorNameErrorCode = 'single_sign_on.duplicate_connector_name';

const dataToFormParser = (data: DataType) => {
  const { branding, connectorName, domains, syncProfile } = data;
  return {
    branding,
    connectorName,
    domains: domains.map((domain) => ({ value: domain, id: generateStandardShortId() })),
    syncProfile: syncProfile ? SyncProfileMode.EachSignIn : SyncProfileMode.OnlyAtRegister,
  };
};

const formDataToSsoConnectorParser = (
  formData: FormType
): Pick<SsoConnector, 'branding' | 'connectorName' | 'domains' | 'syncProfile'> => {
  const { branding, connectorName, domains, syncProfile } = formData;
  return {
    branding,
    connectorName,
    domains: domains.map(({ value }) => value),
    syncProfile: syncProfile === SyncProfileMode.EachSignIn,
  };
};

function Experience({ data, isDeleted, onUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isReady: isUserAssetsServiceReady } = useUserAssetsService();
  const api = useApi({ hideErrorToast: true });

  const syncProfileOptions = [
    {
      value: SyncProfileMode.OnlyAtRegister,
      title: t('enterprise_sso_details.sync_profile_option.register_only'),
    },
    {
      value: SyncProfileMode.EachSignIn,
      title: t('enterprise_sso_details.sync_profile_option.each_sign_in'),
    },
  ];

  const formMethods = useForm<FormType>({ defaultValues: dataToFormParser(data) });
  const {
    control,
    watch,
    setValue,
    setError,
    clearErrors,
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
          // Only keep non-empty values since PATCH operation performs a merge scheme.
          .patch(`api/sso-connectors/${data.id}`, {
            json: cleanDeep(formDataToSsoConnectorParser(formData)),
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

  return (
    <FormProvider {...formMethods}>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard title="enterprise_sso_details.general_settings_title">
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
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <MultiInput
                  values={value}
                  // Per previous error handling on submitting, error message will be truthy.
                  error={errors.domains?.message}
                  placeholder="enterprise_sso_details.email_domain_field_placeholder"
                  onChange={(values) => {
                    const { duplicatedDomains, forbiddenDomains } =
                      findDuplicatedOrBlockedEmailDomains(values.map((domain) => domain.value));
                    const isAnyDomainInvalid = values.some(
                      ({ value }) => !domainRegExp.test(value)
                    );

                    // Show error message and update the inputs' status for error display.
                    if (
                      duplicatedDomains.size > 0 ||
                      forbiddenDomains.size > 0 ||
                      isAnyDomainInvalid
                    ) {
                      onChange(
                        values.map(({ status, ...rest }) => ({
                          ...rest,
                          ...conditional(
                            (duplicatedDomains.has(rest.value) ||
                              forbiddenDomains.has(rest.value) ||
                              !domainRegExp.test(rest.value)) && {
                              status: 'info',
                            }
                          ),
                        }))
                      );
                      setError('domains', {
                        type: 'custom',
                        message: conditionalArray(
                          conditionalString(
                            duplicatedDomains.size > 0 &&
                              globalTranslate(`errors:${duplicatedDomainsErrorCode}`)
                          ),
                          conditionalString(
                            forbiddenDomains.size > 0 &&
                              globalTranslate(`errors:${forbiddenDomainsErrorCode}`)
                          ),
                          conditionalString(
                            isAnyDomainInvalid &&
                              globalTranslate(`errors:${invalidDomainFormatErrorCode}`)
                          )
                        ).join(' '),
                      });
                      return;
                    }

                    // Should clear the current field's error message and clear error status for input options when there is no error.
                    onChange(
                      values.map((domain) => {
                        const { status, ...rest } = domain;
                        return rest;
                      })
                    );
                    clearErrors('domains');
                  }}
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
        </FormCard>
        <FormCard
          title="enterprise_sso_details.custom_branding_title"
          description="enterprise_sso_details.custom_branding_description"
        >
          <FormField title="enterprise_sso_details.display_name_field_name">
            <TextInput
              {...register('branding.displayName')}
              error={errors.branding?.displayName?.message}
            />
          </FormField>
          {isUserAssetsServiceReady ? (
            <FormField
              title="enterprise_sso_details.connector_logo_field_name"
              headlineSpacing="large"
            >
              <LogosUploader />
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
