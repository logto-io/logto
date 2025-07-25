import {
  type DesensitizedSocialTokenSetSecret,
  type DesensitizedEnterpriseSsoTokenSetSecret,
  type ConnectorResponse,
  type SsoConnectorWithProviderConfig,
  SsoProviderType,
} from '@logto/schemas';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ConnectorName from '@/components/ConnectorName';
import FormCard from '@/components/FormCard';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import { type TokenStatus } from '@/types/connector';
import { getTokenStatus } from '@/utils/connector';

import DeleteSecretConfirmModal from './DeleteSecretConfirmModal';
import TokenCard from './TokenCard';
import styles from './index.module.scss';

export enum ConnectorType {
  Social = 'social',
  EnterpriseSso = 'enterprise_sso',
}

type TokenStatusProps = {
  readonly accessTokenStatus: TokenStatus;
  readonly hasRefreshToken: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expiresAt: string;
  readonly scope?: string;
};

const formatDate = (date: number) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

type Props =
  | {
      readonly type: ConnectorType.Social;
      readonly tokenSecret?: DesensitizedSocialTokenSetSecret;
      readonly connector?: ConnectorResponse;
      readonly mutate: () => void;
    }
  | {
      readonly type: ConnectorType.EnterpriseSso;
      readonly tokenSecret?: DesensitizedEnterpriseSsoTokenSetSecret;
      readonly connector?: SsoConnectorWithProviderConfig;
      readonly mutate: () => void;
    };

function TokenStorage({ type, tokenSecret, connector, mutate }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const isTokenStorageSupported = useMemo(() => {
    return type === ConnectorType.Social
      ? connector?.isTokenStorageSupported
      : connector?.providerType === SsoProviderType.OIDC;
  }, [connector, type]);

  const tokenStatus = useMemo<TokenStatusProps>(() => {
    const { createdAt, metadata, updatedAt } = tokenSecret ?? {};

    return {
      accessTokenStatus: getTokenStatus(isTokenStorageSupported, tokenSecret),
      hasRefreshToken: Boolean(metadata?.hasRefreshToken),
      createdAt: createdAt ? formatDate(createdAt) : '-',
      updatedAt: updatedAt ? formatDate(updatedAt) : '-',
      // `expiresAt` is in seconds, so we multiply by 1000 to convert to milliseconds for formatting
      expiresAt: metadata?.expiresAt ? formatDate(metadata.expiresAt * 1000) : '-',
      scope: metadata?.scope,
    };
  }, [isTokenStorageSupported, tokenSecret]);

  const connectorNameText = useMemo(() => {
    return type === ConnectorType.Social ? connector?.name.en : connector?.name;
  }, [connector, type]);

  if (!connector || !isTokenStorageSupported) {
    return null;
  }

  return (
    <FormCard
      title="user_identity_details.token_storage.title"
      description="user_identity_details.token_storage.description"
      descriptionInterpolation={{
        connectorName: connectorNameText,
      }}
    >
      {!connector.enableTokenStorage && (
        <FormField title="user_identity_details.token_storage_disabled.title">
          <InlineNotification severity="info">
            <Trans
              components={{
                connectorName: <ConnectorName name={connector.name} />,
              }}
            >
              {t('user_identity_details.token_storage_disabled.description', {
                connectorName: connectorNameText,
              })}
            </Trans>{' '}
            {type === ConnectorType.Social ? (
              <TextLink to={`/connectors/social/${connector.id}`}>
                {t('connectors.title')} {'>'} {connectorNameText}
              </TextLink>
            ) : (
              <TextLink to={`/enterprise-sso/${connector.id}/experience`}>
                {t('enterprise_sso.title')} {'>'} {connectorNameText}
              </TextLink>
            )}
          </InlineNotification>
        </FormField>
      )}

      {connector.enableTokenStorage && (
        <>
          <FormField title="user_identity_details.token_status">
            <div className={styles.tokenStatus}>
              <TokenCard
                title="user_identity_details.access_token.title"
                status={tokenStatus.accessTokenStatus}
                connectorName={connectorNameText}
              />
              {tokenSecret && (
                <InlineNotification severity={tokenStatus.hasRefreshToken ? 'success' : 'info'}>
                  {tokenStatus.hasRefreshToken
                    ? t('user_identity_details.refresh_token.available')
                    : t('user_identity_details.refresh_token.not_available')}
                </InlineNotification>
              )}
            </div>
          </FormField>
          {tokenSecret && (
            <>
              <FormField title="user_identity_details.created_at">
                <CopyToClipboard
                  displayType="block"
                  variant="border"
                  value={tokenStatus.createdAt}
                />
              </FormField>
              <FormField title="user_identity_details.updated_at">
                <CopyToClipboard
                  displayType="block"
                  variant="border"
                  value={tokenStatus.updatedAt}
                />
              </FormField>
              <FormField title="user_identity_details.expires_at">
                <CopyToClipboard
                  displayType="block"
                  variant="border"
                  value={tokenStatus.expiresAt}
                />
              </FormField>
              <FormField title="user_identity_details.scopes">
                <CopyToClipboard
                  displayType="block"
                  variant="border"
                  value={tokenStatus.scope ?? ''}
                  className={styles.multiLine}
                />
              </FormField>
            </>
          )}
        </>
      )}

      {connector.enableTokenStorage && tokenSecret && (
        <FormField title="user_identity_details.delete_tokens.title">
          <div className={styles.deleteCard}>
            <div className={styles.description}>
              {t('user_identity_details.delete_tokens.description', {
                connectorName: type === ConnectorType.Social ? connector.name.en : connector.name,
              })}
            </div>
            <Button
              type="outlineDanger"
              title="user_identity_details.delete_tokens.title"
              onClick={() => {
                setShowDeleteConfirmModal(true);
              }}
            />
          </div>
        </FormField>
      )}

      {connector.enableTokenStorage && tokenSecret && (
        <DeleteSecretConfirmModal
          isOpen={showDeleteConfirmModal}
          connectorName={type === ConnectorType.Social ? connector.name.en : connector.name}
          secretId={tokenSecret.id}
          onCancel={() => {
            setShowDeleteConfirmModal(false);
          }}
          onDeleteCallback={async () => {
            mutate();
            setShowDeleteConfirmModal(false);
          }}
        />
      )}
    </FormCard>
  );
}

export default TokenStorage;
