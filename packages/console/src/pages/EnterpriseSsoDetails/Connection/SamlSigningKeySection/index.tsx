import { type SamlSsoConnectorSigningKeyResponse } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import SamlCertificateTable from '@/components/SamlCertificateTable';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import useApi, { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { type SamlConnectorConfig } from '@/pages/EnterpriseSsoDetails/types/saml';

import styles from './index.module.scss';

type Props = {
  readonly connectorId: string;
};

function SamlSigningKeySection({ connectorId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { show } = useConfirmModal();
  const { control } = useFormContext<SamlConnectorConfig>();
  const signAuthnRequest = useWatch({ control, name: 'signAuthnRequest' });

  const signingKeys = useSWR<SamlSsoConnectorSigningKeyResponse[], RequestError>(
    `api/sso-connectors/${connectorId}/signing-keys`
  );
  const signingKeysData = useMemo(() => signingKeys.data ?? [], [signingKeys.data]);
  const hasActiveSigningKey = signingKeysData.some(({ active }) => active);
  const [isGenerating, setIsGenerating] = useState(false);

  const buildDownloadFilename = useCallback(
    (id: string) => `${connectorId}-sp-signing-certificate-${id}`,
    [connectorId]
  );

  const onGenerate = useCallback(async () => {
    // Derive first-key activation from the confirmed list only. While it is still loading (or after a
    // fetch error) `signingKeys.data` is undefined; generating then could send `active: true` and
    // atomically rotate away from a certificate the identity provider has already registered, breaking
    // SAML sign-in for the connection.
    if (isGenerating || !signingKeys.data) {
      return;
    }
    setIsGenerating(true);

    try {
      // The first key becomes active right away; later keys are staged for rotation — activate
      // them from the table once their certificate is registered at the identity provider.
      await api.post(`api/sso-connectors/${connectorId}/signing-keys`, {
        json: { active: signingKeys.data.length === 0 },
      });
      toast.success(t('enterprise_sso.basic_info.saml.signing_key_generated'));
      void signingKeys.mutate();
    } finally {
      setIsGenerating(false);
    }
  }, [api, connectorId, isGenerating, signingKeys, t]);

  const onActivate = useCallback(
    async (id: string) => {
      await api.patch(`api/sso-connectors/${connectorId}/signing-keys/${id}`, {
        json: { active: true },
      });
      toast.success(t('enterprise_sso.basic_info.saml.signing_key_activated'));
      // Activating a key deactivates all other keys.
      void signingKeys.mutate(
        signingKeysData.map((signingKey) => ({ ...signingKey, active: signingKey.id === id }))
      );
    },
    [api, connectorId, signingKeys, signingKeysData, t]
  );

  const onDeactivate = useCallback(
    async (id: string) => {
      await api.patch(`api/sso-connectors/${connectorId}/signing-keys/${id}`, {
        json: { active: false },
      });
      toast.success(t('enterprise_sso.basic_info.saml.signing_key_deactivated'));
      void signingKeys.mutate(
        signingKeysData.map((signingKey) =>
          signingKey.id === id ? { ...signingKey, active: false } : signingKey
        )
      );
    },
    [api, connectorId, signingKeys, signingKeysData, t]
  );

  const onDelete = useCallback(
    async (id: string) => {
      await api.delete(`api/sso-connectors/${connectorId}/signing-keys/${id}`);
      toast.success(t('enterprise_sso.basic_info.saml.signing_key_deleted'));
      void signingKeys.mutate(signingKeysData.filter(({ id: keyId }) => keyId !== id));
    },
    [api, connectorId, signingKeys, signingKeysData, t]
  );

  return (
    <>
      <FormField
        title="enterprise_sso.basic_info.saml.sign_auth_request"
        tip={t('enterprise_sso.basic_info.saml.sign_auth_request_warning')}
      >
        <Controller
          name="signAuthnRequest"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Switch
              checked={Boolean(value)}
              description="enterprise_sso.basic_info.saml.sign_auth_request_tooltip"
              onChange={async ({ currentTarget: { checked } }) => {
                // Only interrupt when enabling without a usable key — with an active key the
                // certificate is already manageable below, so the tooltip guidance suffices.
                if (!checked || hasActiveSigningKey) {
                  onChange(checked);
                  return;
                }

                const [confirmed] = await show({
                  ModalContent: () => (
                    <DynamicT forKey="enterprise_sso.basic_info.saml.sign_auth_request_warning" />
                  ),
                  confirmButtonText: 'general.confirm',
                  confirmButtonType: 'primary',
                });

                if (confirmed) {
                  onChange(true);
                }
              }}
            />
          )}
        />
      </FormField>
      {(Boolean(signAuthnRequest) || signingKeysData.length > 0) && (
        <FormField title="enterprise_sso.basic_info.saml.signing_certificate_field_name">
          {signingKeys.data?.length === 0 ? (
            <>
              <div className={styles.empty}>
                {t('enterprise_sso.basic_info.saml.signing_keys_empty')}
              </div>
              <Button
                icon={<Plus />}
                title="enterprise_sso.basic_info.saml.generate_signing_key"
                disabled={isGenerating}
                onClick={onGenerate}
              />
            </>
          ) : (
            <>
              <SamlCertificateTable
                data={signingKeysData}
                isLoading={!signingKeys.data && !signingKeys.error}
                errorMessage={signingKeys.error?.body?.message ?? signingKeys.error?.message}
                buildDownloadFilename={buildDownloadFilename}
                onDelete={onDelete}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
              />
              <Button
                size="small"
                type="text"
                className={styles.add}
                icon={<CirclePlus />}
                title="enterprise_sso.basic_info.saml.generate_signing_key"
                disabled={isGenerating || !signingKeys.data}
                onClick={onGenerate}
              />
            </>
          )}
        </FormField>
      )}
    </>
  );
}

export default SamlSigningKeySection;
