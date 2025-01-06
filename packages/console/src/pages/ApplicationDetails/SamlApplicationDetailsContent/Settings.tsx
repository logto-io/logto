import { type SamlApplicationSecretResponse, type SamlApplicationResponse } from '@logto/schemas';
import { appendPath, type Nullable } from '@silverhand/essentials';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR, { type KeyedMutator } from 'swr';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import TextInput from '@/ds-components/TextInput';
import useApi, { type RequestError } from '@/hooks/use-api';
import useCustomDomain from '@/hooks/use-custom-domain';
import { trySubmitSafe } from '@/utils/form';
import { uriValidator } from '@/utils/validator';

import CreateSecretModal from './CreateSecretModal';
import styles from './index.module.scss';
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
  const [showCreateSecretModal, setShowCreateSecretModal] = useState(false);

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

  const secretsData = useMemo(() => secrets.data ?? [], [secrets.data]);

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

  const onDelete = useCallback(
    async (id: string) => {
      await api.delete(`api/saml-applications/${data.id}/secrets/${id}`);
      toast.success(t('application_details.secrets.deleted'));
      void secrets.mutate(secretsData.filter(({ id: secretId }) => secretId !== id));
    },
    [api, data.id, secrets, secretsData, t]
  );

  const onActivate = useCallback(
    async (id: string) => {
      await api.patch(`api/saml-applications/${data.id}/secrets/${id}`, { json: { active: true } });
      toast.success(t('application_details.secrets.activated'));
      // Activate a secret will deactivate all other secrets.
      void secrets.mutate(
        secretsData.map((secret) =>
          secret.id === id ? { ...secret, active: true } : { ...secret, active: false }
        )
      );
    },
    [api, data.id, secrets, secretsData, t]
  );

  const onDeactivate = useCallback(
    async (id: string) => {
      await api.patch(`api/saml-applications/${data.id}/secrets/${id}`, {
        json: { active: false },
      });
      toast.success(t('application_details.secrets.deactivated'));
      void secrets.mutate(
        secretsData.map((secret) => (secret.id === id ? { ...secret, active: false } : secret))
      );
    },
    [api, data.id, secrets, secretsData, t]
  );

  const secretTableColumns = useSecretTableColumns({
    appId: data.id,
    onDelete,
    onActivate,
    onDeactivate,
  });

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
            {secretsData.length === 0 && !secrets.error ? (
              <>
                <div className={styles.empty}>{t('application_details.secrets.empty')}</div>
                <Button
                  icon={<Plus />}
                  title="application_details.secrets.create_new_secret"
                  onClick={() => {
                    setShowCreateSecretModal(true);
                  }}
                />
              </>
            ) : (
              <>
                <Table
                  hasBorder
                  isRowHoverEffectDisabled
                  rowIndexKey="id"
                  isLoading={!secrets.data && !secrets.error}
                  errorMessage={secrets.error?.body?.message ?? secrets.error?.message}
                  rowGroups={[{ key: 'application_secrets', data: secretsData }]}
                  columns={secretTableColumns}
                />
                <Button
                  size="small"
                  type="text"
                  className={styles.add}
                  icon={<CirclePlus />}
                  title="application_details.secrets.create_new_secret"
                  onClick={() => {
                    setShowCreateSecretModal(true);
                  }}
                />
              </>
            )}
            <CreateSecretModal
              appId={data.id}
              isOpen={showCreateSecretModal}
              onClose={(created) => {
                if (created) {
                  void secrets.mutate();
                }
                setShowCreateSecretModal(false);
              }}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} onConfirm={reset} />
    </>
  );
}

export default Settings;
