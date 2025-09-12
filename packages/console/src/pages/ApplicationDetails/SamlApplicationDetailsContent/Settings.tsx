/* eslint-disable max-lines */
import { type AdminConsoleKey } from '@logto/phrases';
import {
  type SamlApplicationSecretResponse,
  type SamlApplicationResponse,
  NameIdFormat,
} from '@logto/schemas';
import { appendPath, type Nullable } from '@silverhand/essentials';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR, { type KeyedMutator } from 'swr';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import DetailsForm from '@/components/DetailsForm';
import DomainSelector from '@/components/DomainSelector';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isCloud } from '@/consts/env';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';
import Switch from '@/ds-components/Switch';
import Table from '@/ds-components/Table';
import TextInput from '@/ds-components/TextInput';
import Textarea from '@/ds-components/Textarea';
import useApi, { type RequestError } from '@/hooks/use-api';
import useDomainSelection from '@/hooks/use-domain-selection';
import { trySubmitSafe } from '@/utils/form';
import { applyDomain } from '@/utils/url';
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
  validateCertificate,
} from './utils';

export type SamlApplicationFormData = Pick<
  SamlApplicationResponse,
  'id' | 'description' | 'name' | 'entityId' | 'nameIdFormat'
> & {
  // Currently we only support HTTP-POST binding
  // Keep the acsUrl as a string in the form data instead of the object
  acsUrl: Nullable<string>;
  encryptSamlAssertion: boolean;
  encryptThenSignSamlAssertion: boolean;
  certificate?: string;
};

type Props = {
  readonly data: SamlApplicationResponse;
  readonly mutateApplication: KeyedMutator<SamlApplicationResponse>;
  readonly isDeleted: boolean;
};

type NameIdFormatToTranslationKey = {
  [key in NameIdFormat]: AdminConsoleKey;
};

const nameIdFormatToOptionMap = Object.freeze({
  [NameIdFormat.EmailAddress]: 'application_details.saml_idp_name_id_format.email_address',
  [NameIdFormat.Transient]: 'application_details.saml_idp_name_id_format.transient',
  [NameIdFormat.Persistent]: 'application_details.saml_idp_name_id_format.persistent',
  [NameIdFormat.Unspecified]: 'application_details.saml_idp_name_id_format.unspecified',
}) satisfies NameIdFormatToTranslationKey;

const nameIdFormatToOptionDescriptionMap = Object.freeze({
  [NameIdFormat.EmailAddress]:
    'application_details.saml_idp_name_id_format.email_address_description',
  [NameIdFormat.Transient]: 'application_details.saml_idp_name_id_format.transient_description',
  [NameIdFormat.Persistent]: 'application_details.saml_idp_name_id_format.persistent_description',
  [NameIdFormat.Unspecified]: 'application_details.saml_idp_name_id_format.unspecified_description',
}) satisfies NameIdFormatToTranslationKey;

function Settings({ data, mutateApplication, isDeleted }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tenantEndpoint } = useContext(AppDataContext);
  const [selectedDomain, setSelectedDomain] = useDomainSelection();
  const [showCreateSecretModal, setShowCreateSecretModal] = useState(false);

  const secrets = useSWR<SamlApplicationSecretResponse[], RequestError>(
    `api/saml-applications/${data.id}/secrets`
  );

  const {
    watch,
    control,
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
              placeholder={t('enterprise_sso.basic_info.saml.acs_url_field_placeholder')}
            />
          </FormField>
          <FormField
            isRequired
            title="enterprise_sso.basic_info.saml.entity_id_field_name"
            tip={t('enterprise_sso.basic_info.saml.entity_id_field_tooltip')}
          >
            <TextInput
              {...register('entityId', {
                required: t('errors.required_field_missing', {
                  field: t('enterprise_sso.basic_info.saml.entity_id_field_name'),
                }),
              })}
              error={Boolean(errors.entityId)}
              placeholder={t('enterprise_sso.basic_info.saml.entity_id_field_placeholder')}
            />
          </FormField>
        </FormCard>
        <FormCard
          title="application_details.saml_idp_config.title"
          description="application_details.saml_idp_config.description"
        >
          {isCloud && (
            <DomainSelector
              tip={t('domain.switch_saml_app_domain_tip')}
              value={selectedDomain}
              onChange={setSelectedDomain}
            />
          )}
          {tenantEndpoint && (
            <>
              <FormField title="application_details.saml_idp_config.metadata_url_label">
                <CopyToClipboard
                  displayType="block"
                  value={applyDomain(
                    appendPath(
                      tenantEndpoint,
                      samlApplicationManagementApiPrefix,
                      data.id,
                      samlApplicationMetadataEndpointSuffix
                    ).href,
                    selectedDomain
                  )}
                  variant="border"
                />
              </FormField>
              <FormField title="application_details.saml_idp_config.single_sign_on_service_url_label">
                <CopyToClipboard
                  displayType="block"
                  value={applyDomain(
                    appendPath(
                      tenantEndpoint,
                      '/api',
                      samlApplicationEndpointPrefix,
                      data.id,
                      samlApplicationSingleSignOnEndpointSuffix
                    ).href,
                    selectedDomain
                  )}
                  variant="border"
                />
              </FormField>
              <FormField title="application_details.saml_idp_config.idp_entity_id_label">
                <CopyToClipboard
                  displayType="block"
                  value={applyDomain(
                    appendPath(tenantEndpoint, samlApplicationEndpointPrefix, data.id).href,
                    selectedDomain
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
          <FormField title="application_details.saml_idp_name_id_format.title">
            <Controller
              name="nameIdFormat"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={Object.values(NameIdFormat).map((format) => ({
                    value: format,
                    title: (
                      <span>
                        {t(nameIdFormatToOptionMap[format])}
                        <span className={styles.nameIdFormatDescription}>
                          ({t(nameIdFormatToOptionDescriptionMap[format])})
                        </span>
                      </span>
                    ),
                  }))}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormField>
          <FormField title="application_details.saml_encryption_config.encrypt_assertion">
            <Switch
              label={t('application_details.saml_encryption_config.encrypt_assertion_description')}
              {...register('encryptSamlAssertion')}
            />
          </FormField>
          {watch('encryptSamlAssertion') && (
            <>
              <FormField title="application_details.saml_encryption_config.encrypt_then_sign">
                <Switch
                  label={t(
                    'application_details.saml_encryption_config.encrypt_then_sign_description'
                  )}
                  {...register('encryptThenSignSamlAssertion')}
                />
              </FormField>
              <FormField
                title="application_details.saml_encryption_config.certificate"
                tip={t('application_details.saml_encryption_config.certificate_tooltip')}
              >
                <Textarea
                  rows={5}
                  error={errors.certificate?.message}
                  {...register('certificate', {
                    validate: (value) => {
                      if (!value) {
                        return t(
                          'application_details.saml_encryption_config.certificate_missing_error'
                        );
                      }

                      return (
                        validateCertificate(value) ||
                        t(
                          'application_details.saml_encryption_config.certificate_invalid_format_error'
                        )
                      );
                    },
                  })}
                  placeholder={t(
                    'application_details.saml_encryption_config.certificate_placeholder'
                  )}
                />
              </FormField>
            </>
          )}
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} onConfirm={reset} />
    </>
  );
}

export default Settings;
/* eslint-enable max-lines */
