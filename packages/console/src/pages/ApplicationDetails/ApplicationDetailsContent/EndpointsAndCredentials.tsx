import {
  type ApplicationSecret,
  DomainStatus,
  type Application,
  type SnakeCaseOidcConfig,
  internalPrefix,
  hasSecrets,
} from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CaretDown from '@/assets/icons/caret-down.svg';
import CaretUp from '@/assets/icons/caret-up.svg';
import CirclePlus from '@/assets/icons/circle-plus.svg';
import Plus from '@/assets/icons/plus.svg';
import ActionsButton from '@/components/ActionsButton';
import FormCard from '@/components/FormCard';
import { isDevFeaturesEnabled } from '@/consts/env';
import { openIdProviderConfigPath, openIdProviderPath } from '@/consts/oidc';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import { type Column } from '@/ds-components/Table/types';
import TextLink from '@/ds-components/TextLink';
import useApi, { type RequestError } from '@/hooks/use-api';
import useCustomDomain from '@/hooks/use-custom-domain';

import CreateSecretModal from './CreateSecretModal';
import * as styles from './index.module.scss';

const isLegacySecret = (secret: string) => !secret.startsWith(internalPrefix);

type ApplicationSecretRow = Pick<ApplicationSecret, 'name' | 'value' | 'expiresAt'> & {
  isLegacy?: boolean;
};

type Props = {
  readonly app: Application;
  readonly oidcConfig: SnakeCaseOidcConfig;
  readonly onApplicationUpdated: () => void;
};

function EndpointsAndCredentials({
  app: { type, secret, id, isThirdParty },
  oidcConfig,
  onApplicationUpdated,
}: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const [showMoreEndpoints, setShowMoreEndpoints] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: customDomain, applyDomain: applyCustomDomain } = useCustomDomain();
  const [showCreateSecretModal, setShowCreateSecretModal] = useState(false);
  const secrets = useSWR<ApplicationSecretRow[], RequestError>(`api/applications/${id}/secrets`);
  const api = useApi();
  const shouldShowAppSecrets = hasSecrets(type);

  const toggleShowMoreEndpoints = useCallback(() => {
    setShowMoreEndpoints((previous) => !previous);
  }, []);

  const ToggleVisibleCaretIcon = showMoreEndpoints ? CaretUp : CaretDown;

  const secretsData = useMemo(
    () => [
      ...(isLegacySecret(secret)
        ? [
            {
              name: t('application_details.secrets.legacy_secret'),
              value: secret,
              expiresAt: null,
              isLegacy: true,
            },
          ]
        : []),
      ...(secrets.data ?? []),
    ],
    [secret, secrets.data, t]
  );
  const tableColumns: Array<Column<ApplicationSecretRow>> = useMemo(
    () => [
      {
        title: t('general.name'),
        dataIndex: 'name',
        colSpan: 3,
        render: ({ name }) => <span>{name}</span>,
      },
      {
        title: t('application_details.secrets.value'),
        dataIndex: 'value',
        colSpan: 6,
        render: ({ value }) => (
          <CopyToClipboard hasVisibilityToggle displayType="block" value={value} variant="text" />
        ),
      },
      {
        title: t('application_details.secrets.expires_at'),
        dataIndex: 'expiresAt',
        colSpan: 3,
        render: ({ expiresAt }) => (
          <span>
            {expiresAt
              ? new Date(expiresAt).toLocaleString()
              : t('application_details.secrets.never')}
          </span>
        ),
      },
      {
        title: '',
        dataIndex: 'actions',
        render: ({ name, isLegacy }) => (
          <ActionsButton
            fieldName="application_details.application_secret"
            deleteConfirmation="application_details.secrets.delete_confirmation"
            onDelete={async () => {
              if (isLegacy) {
                await api.delete(`api/applications/${id}/legacy-secret`);
                onApplicationUpdated();
              } else {
                await api.delete(`api/applications/${id}/secrets/${encodeURIComponent(name)}`);
                void secrets.mutate();
              }
            }}
          />
        ),
      },
    ],
    [api, id, onApplicationUpdated, secrets, t]
  );

  return (
    <FormCard
      title="application_details.endpoints_and_credentials"
      description="application_details.endpoints_and_credentials_description"
      learnMoreLink={{
        href: 'https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint',
        targetBlank: true,
      }}
    >
      {/* Hide logto endpoint field in third-party application's form. */}
      {tenantEndpoint && !isThirdParty && (
        <FormField title="application_details.logto_endpoint">
          <CopyToClipboard
            displayType="block"
            value={applyCustomDomain(tenantEndpoint.href)}
            variant="border"
          />
        </FormField>
      )}
      {tenantEndpoint && (
        <FormField title="application_details.issuer_endpoint">
          <CopyToClipboard
            displayType="block"
            value={applyCustomDomain(appendPath(tenantEndpoint, openIdProviderPath).href)}
            variant="border"
          />
        </FormField>
      )}
      {showMoreEndpoints && (
        <>
          {tenantEndpoint && (
            <FormField title="application_details.config_endpoint">
              <CopyToClipboard
                displayType="block"
                value={applyCustomDomain(appendPath(tenantEndpoint, openIdProviderConfigPath).href)}
                variant="border"
              />
            </FormField>
          )}
          <FormField
            title="application_details.authorization_endpoint"
            tip={(closeTipHandler) => (
              <Trans
                components={{
                  a: (
                    <TextLink
                      targetBlank
                      href="https://openid.net/specs/openid-connect-core-1_0.html#Authentication"
                      onClick={closeTipHandler}
                    />
                  ),
                }}
              >
                {t('application_details.authorization_endpoint_tip')}
              </Trans>
            )}
          >
            <CopyToClipboard
              displayType="block"
              value={applyCustomDomain(oidcConfig.authorization_endpoint)}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.token_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyCustomDomain(oidcConfig.token_endpoint)}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.user_info_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyCustomDomain(oidcConfig.userinfo_endpoint)}
              variant="border"
            />
          </FormField>
        </>
      )}
      <div className={styles.fieldButton}>
        <Button
          size="small"
          type="text"
          title={
            showMoreEndpoints
              ? 'application_details.hide_endpoint_details'
              : 'application_details.show_endpoint_details'
          }
          trailingIcon={<ToggleVisibleCaretIcon className={styles.trailingIcon} />}
          onClick={toggleShowMoreEndpoints}
        />
      </div>

      {customDomain?.status === DomainStatus.Active && tenantEndpoint && (
        <div className={styles.customEndpointNotes}>
          <DynamicT
            forKey="domain.custom_endpoint_note"
            interpolation={{
              custom: customDomain.domain,
              default: new URL(tenantEndpoint).host,
            }}
          />
        </div>
      )}
      <FormField title="application_details.application_id">
        <CopyToClipboard displayType="block" value={id} variant="border" />
      </FormField>
      {!isDevFeaturesEnabled && shouldShowAppSecrets && (
        <FormField title="application_details.application_secret">
          <CopyToClipboard
            hasVisibilityToggle
            displayType="block"
            value={secret}
            variant="border"
          />
        </FormField>
      )}
      {isDevFeaturesEnabled && shouldShowAppSecrets && (
        <FormField title="application_details.application_secret_other">
          {secretsData.length === 0 && !secrets.error ? (
            <>
              <div className={styles.empty}>
                {t('organizations.empty_placeholder', {
                  entity: t('application_details.application_secret').toLowerCase(),
                })}
              </div>
              <Button
                icon={<Plus />}
                title="general.add"
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
                rowIndexKey="name"
                isLoading={!secrets.data && !secrets.error}
                errorMessage={secrets.error?.body?.message ?? secrets.error?.message}
                rowGroups={[{ key: 'application_secrets', data: secretsData }]}
                columns={tableColumns}
                className={styles.table}
              />
              <Button
                size="small"
                type="text"
                className={styles.add}
                title="application_details.secrets.create_new_secret"
                icon={<CirclePlus />}
                onClick={() => {
                  setShowCreateSecretModal(true);
                }}
              />
            </>
          )}
          <CreateSecretModal
            appId={id}
            isOpen={showCreateSecretModal}
            onClose={() => {
              setShowCreateSecretModal(false);
              void secrets.mutate();
            }}
          />
        </FormField>
      )}
    </FormCard>
  );
}

export default EndpointsAndCredentials;
