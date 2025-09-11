import {
  type Application,
  type SnakeCaseOidcConfig,
  internalPrefix,
  hasSecrets,
} from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CaretDown from '@/assets/icons/caret-down.svg?react';
import CaretUp from '@/assets/icons/caret-up.svg?react';
import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import DomainSelector from '@/components/DomainSelector';
import FormCard from '@/components/FormCard';
import { isCloud } from '@/consts/env';
import { customDomainFeatureLink } from '@/consts/external-links';
import {
  openIdProviderConfigPath,
  openIdProviderJwksPath,
  openIdProviderPath,
} from '@/consts/oidc';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import TextLink from '@/ds-components/TextLink';
import { type RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useDomainSelection from '@/hooks/use-domain-selection';
import { applyDomain } from '@/utils/url';

import CreateSecretModal from '../CreateSecretModal';
import EditSecretModal from '../EditSecretModal';

import styles from './index.module.scss';
import { type ApplicationSecretRow, useSecretTableColumns } from './use-secret-table-columns';

export { type ApplicationSecretRow } from './use-secret-table-columns';

const isLegacySecret = (secret: string) => !secret.startsWith(internalPrefix);

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
  const { getDocumentationUrl } = useDocumentationUrl();

  const [selectedDomain, setSelectedDomain] = useDomainSelection();
  const [showCreateSecretModal, setShowCreateSecretModal] = useState(false);
  const [editSecret, setEditSecret] = useState<ApplicationSecretRow>();
  const secrets = useSWR<ApplicationSecretRow[], RequestError>(`api/applications/${id}/secrets`);
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

  const onUpdated = useCallback(
    (isLegacy: boolean) => {
      if (isLegacy) {
        onApplicationUpdated();
      } else {
        void secrets.mutate();
      }
    },
    [onApplicationUpdated, secrets]
  );
  const onEditSecret = useCallback((secret: ApplicationSecretRow) => {
    setEditSecret(secret);
  }, []);
  const tableColumns = useSecretTableColumns({
    appId: id,
    onUpdated,
    onEdit: onEditSecret,
  });
  return (
    <FormCard
      title="application_details.endpoints_and_credentials"
      description="application_details.endpoints_and_credentials_description"
      learnMoreLink={{
        href: 'https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint',
        targetBlank: true,
      }}
    >
      {isCloud && (
        <DomainSelector
          value={selectedDomain}
          tip={(closeTipHandler) => (
            <Trans
              components={{
                a: (
                  <TextLink
                    targetBlank="noopener"
                    href={getDocumentationUrl(customDomainFeatureLink)}
                    onClick={closeTipHandler}
                  />
                ),
              }}
            >
              {t('domain.switch_custom_domain_tip')}
            </Trans>
          )}
          onChange={setSelectedDomain}
        />
      )}
      {/* Hide logto endpoint field in third-party application's form. */}
      {tenantEndpoint && !isThirdParty && (
        <FormField title="application_details.logto_endpoint">
          <CopyToClipboard
            displayType="block"
            value={applyDomain(tenantEndpoint.href, selectedDomain)}
            variant="border"
          />
        </FormField>
      )}
      {tenantEndpoint && (
        <>
          <FormField title="application_details.issuer_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyDomain(
                appendPath(tenantEndpoint, openIdProviderPath).href,
                selectedDomain
              )}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.jwks_uri">
            <CopyToClipboard
              displayType="block"
              value={applyDomain(
                appendPath(tenantEndpoint, openIdProviderJwksPath).href,
                selectedDomain
              )}
              variant="border"
            />
          </FormField>
        </>
      )}
      {showMoreEndpoints && (
        <>
          {tenantEndpoint && (
            <FormField title="application_details.config_endpoint">
              <CopyToClipboard
                displayType="block"
                value={applyDomain(
                  appendPath(tenantEndpoint, openIdProviderConfigPath).href,
                  selectedDomain
                )}
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
              value={applyDomain(oidcConfig.authorization_endpoint, selectedDomain)}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.token_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyDomain(oidcConfig.token_endpoint, selectedDomain)}
              variant="border"
            />
          </FormField>
          <FormField title="application_details.user_info_endpoint">
            <CopyToClipboard
              displayType="block"
              value={applyDomain(oidcConfig.userinfo_endpoint, selectedDomain)}
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

      <FormField title="application_details.application_id">
        <CopyToClipboard displayType="block" value={id} variant="border" />
      </FormField>
      {shouldShowAppSecrets && (
        <FormField title="application_details.application_secret_other">
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
            onClose={(created) => {
              if (created) {
                void secrets.mutate();
              }
              setShowCreateSecretModal(false);
            }}
          />
          {editSecret && (
            <EditSecretModal
              isOpen
              appId={id}
              secret={editSecret}
              onClose={(updated) => {
                if (updated) {
                  void secrets.mutate();
                }
                setEditSecret(undefined);
              }}
            />
          )}
        </FormField>
      )}
    </FormCard>
  );
}

export default EndpointsAndCredentials;
