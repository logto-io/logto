import { type SamlApplicationSecretResponse, type SamlApplicationResponse } from '@logto/schemas';
import { appendPath, type Nullable } from '@silverhand/essentials';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR, { type KeyedMutator } from 'swr';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { AppDataContext } from '@/contexts/AppDataProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import TextInput from '@/ds-components/TextInput';
import useApi, { type RequestError } from '@/hooks/use-api';
import useCustomDomain from '@/hooks/use-custom-domain';
import { trySubmitSafe } from '@/utils/form';
import { uriValidator } from '@/utils/validator';

import { useSecretTableColumns } from './use-secret-table-columns';
import {
  parseFormDataToSamlApplicationRequest,
  parseSamlApplicationResponseToFormData,
  samlApplicationEndpointPrefix,
  samlApplicationManagementApiPrefix,
  samlApplicationMetadataEndpointSuffix,
  samlApplicationSingleSignOnEndpointSuffix,
} from './utils';

export type SamlApplicationFormData = Pick<
  SamlApplicationResponse,
  'id' | 'description' | 'name' | 'entityId'
> & {
  // Currently we only support HTTP-POST binding
  // Keep the acsUrl as a string in the form data instead of the object
  acsUrl: Nullable<string>;
};

type Props = {
  readonly data: SamlApplicationResponse;
  readonly mutateApplication: KeyedMutator<SamlApplicationResponse>;
  readonly isDeleted: boolean;
};

function Settings({ data, mutateApplication, isDeleted }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tenantEndpoint } = useContext(AppDataContext);
  const { applyDomain: applyCustomDomain } = useCustomDomain();

  const secrets = useSWR<SamlApplicationSecretResponse[], RequestError>(
    `api/saml-applications/${data.id}/secrets`
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<SamlApplicationFormData>({
    defaultValues: parseSamlApplicationResponseToFormData(data),
    mode: 'onBlur',
  });

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      const { id, payload } = parseFormDataToSamlApplicationRequest(formData);

      const updated = await api
        .patch(`api/saml-applications/${id}`, { json: payload })
        .json<SamlApplicationResponse>();

      reset(parseSamlApplicationResponseToFormData(updated));
      void mutateApplication(updated);

      toast.success(t('general.saved'));
    })
  );

  const secretTableColumns = useSecretTableColumns({ appId: data.id });

  return (
    <>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="application_details.settings"
          description="application_details.settings_description"
        >
          <FormField isRequired title="application_details.application_name">
            <TextInput
              {...register('name', {
                required: t('errors.required_field_missing', {
                  field: t('application_details.application_name'),
                }),
              })}
              error={errors.name?.message}
              placeholder={t('application_details.application_name_placeholder')}
            />
          </FormField>
          <FormField title="application_details.description">
            <TextInput
              {...register('description')}
              placeholder={t('application_details.description_placeholder')}
            />
          </FormField>
          <FormField isRequired title="enterprise_sso.basic_info.saml.acs_url_field_name">
            <TextInput
              {...register('acsUrl', {
                required: t('errors.required_field_missing', {
                  field: t('enterprise_sso.basic_info.saml.acs_url_field_name'),
                }),
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              error={Boolean(errors.acsUrl)}
              placeholder={t('enterprise_sso.basic_info.saml.acs_url_field_name')}
            />
          </FormField>
          <FormField isRequired title="enterprise_sso.basic_info.saml.audience_uri_field_name">
            <TextInput
              {...register('entityId', {
                required: t('errors.required_field_missing', {
                  field: t('enterprise_sso.basic_info.saml.audience_uri_field_name'),
                }),
              })}
              error={Boolean(errors.entityId)}
              placeholder={t('enterprise_sso.basic_info.saml.audience_uri_field_name')}
            />
          </FormField>
        </FormCard>
        <FormCard
          title="application_details.saml_idp_config.title"
          description="application_details.saml_idp_config.description"
        >
          {tenantEndpoint && (
            <>
              <FormField title="application_details.saml_idp_config.metadata_url_label">
                <CopyToClipboard
                  displayType="block"
                  value={applyCustomDomain(
                    appendPath(
                      tenantEndpoint,
                      samlApplicationManagementApiPrefix,
                      data.id,
                      samlApplicationMetadataEndpointSuffix
                    ).href
                  )}
                  variant="border"
                />
              </FormField>
              <FormField title="application_details.saml_idp_config.single_sign_on_service_url_label">
                <CopyToClipboard
                  displayType="block"
                  value={applyCustomDomain(
                    appendPath(
                      tenantEndpoint,
                      samlApplicationEndpointPrefix,
                      data.id,
                      samlApplicationSingleSignOnEndpointSuffix
                    ).href
                  )}
                  variant="border"
                />
              </FormField>
              <FormField title="application_details.saml_idp_config.idp_entity_id_label">
                <CopyToClipboard
                  displayType="block"
                  value={applyCustomDomain(
                    appendPath(tenantEndpoint, samlApplicationEndpointPrefix, data.id).href
                  )}
                  variant="border"
                />
              </FormField>
            </>
          )}
          <FormField title="application_details.saml_idp_certificates.title">
            <Table
              hasBorder
              isRowHoverEffectDisabled
              rowIndexKey="id"
              isLoading={!secrets.data && !secrets.error}
              errorMessage={secrets.error?.body?.message ?? secrets.error?.message}
              rowGroups={[{ key: 'application_secrets', data: secrets.data ?? [] }]}
              columns={secretTableColumns}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} onConfirm={reset} />
    </>
  );
}

export default Settings;
