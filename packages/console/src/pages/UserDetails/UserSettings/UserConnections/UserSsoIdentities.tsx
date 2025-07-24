import {
  type SsoConnectorWithProviderConfig,
  type GetUserAllIdentitiesResponse,
  type DesensitizedEnterpriseSsoTokenSetSecret,
  SsoProviderType,
} from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ConnectorTokenStatus from '@/components/ConnectorTokenStatus';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import { type RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import SsoConnectorLogo from '@/pages/EnterpriseSso/SsoConnectorLogo';

import styles from './index.module.scss';

type Props = {
  readonly userId: string;
};

type RowData = {
  providerLogo: SsoConnectorWithProviderConfig['providerLogo'];
  providerLogoDark: SsoConnectorWithProviderConfig['providerLogoDark'];
  branding: SsoConnectorWithProviderConfig['branding'];
  name: SsoConnectorWithProviderConfig['connectorName'];
  identityId: string;
  ssoConnectorId: string;
  tokenStatus: {
    isTokenStorageSupported: boolean;
    tokenSecret?: DesensitizedEnterpriseSsoTokenSetSecret;
  };
};

// Make typescript happy
// eslint-disable-next-line unicorn/prefer-native-coercion-functions
function isRowData(data: RowData | undefined): data is RowData {
  return Boolean(data);
}

function ConnectorName({
  providerLogo,
  providerLogoDark,
  branding,
  name,
}: Pick<RowData, 'branding' | 'name' | 'providerLogo' | 'providerLogoDark'>) {
  return (
    <div className={styles.connectorName}>
      <SsoConnectorLogo
        containerClassName={styles.icon}
        data={{ providerLogo, providerLogoDark, branding }}
      />
      <div className={styles.name}>
        <span>{name}</span>
      </div>
    </div>
  );
}

function UserSsoIdentities({ userId }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const { navigate } = useTenantPathname();

  const {
    data,
    isLoading: isIdentitiesLoading,
    error: identitiesError,
  } = useSWR<GetUserAllIdentitiesResponse, RequestError>(
    `api/users/${userId}/all-identities?includeTokenSecret=true`
  );

  const {
    data: ssoConnectors,
    isLoading: isSsoConnectorsLoading,
    error: ssoConnectorError,
  } = useSWR<SsoConnectorWithProviderConfig[], RequestError>('api/sso-connectors');

  const isLoading = isIdentitiesLoading || isSsoConnectorsLoading;
  const error = identitiesError ?? ssoConnectorError;

  const ssoIdentities = useMemo(() => data?.ssoIdentities ?? [], [data]);

  const rowData = useMemo(() => {
    if (!ssoConnectors?.length) {
      return;
    }

    return ssoIdentities
      .map<RowData | undefined>(({ ssoIdentity, tokenSecret, ssoConnectorId }) => {
        const ssoConnector = ssoConnectors.find((connector) => connector.id === ssoConnectorId);

        if (!ssoConnector) {
          return;
        }

        const {
          providerLogo,
          providerLogoDark,
          branding,
          connectorName: name,
          providerType,
        } = ssoConnector;

        return {
          providerLogo,
          providerLogoDark,
          branding,
          name,
          identityId: ssoIdentity.identityId,
          ssoConnectorId,
          tokenStatus: {
            // All OIDC connectors support token storage, while SAML connectors do not.
            isTokenStorageSupported: providerType === SsoProviderType.OIDC,
            tokenSecret,
          },
        };
      })
      .filter((data): data is RowData => isRowData(data));
  }, [ssoConnectors, ssoIdentities]);

  const hasRows = Boolean(rowData && rowData.length > 0);

  return (
    <FormField title="user_details.field_sso_connectors">
      {!isLoading && !error && (
        <div className={styles.description}>
          {t(
            hasRows
              ? 'user_details.sso_connectors.connected'
              : 'user_details.sso_connectors.not_connected'
          )}
        </div>
      )}
      {(isLoading || hasRows || error) && (
        <Table
          isRowHoverEffectDisabled
          hasBorder
          rowGroups={[{ key: 'ssoIdentities', data: rowData }]}
          rowIndexKey="ssoConnectorId"
          isLoading={isLoading}
          errorMessage={error?.body?.message ?? error?.message}
          columns={[
            {
              title: t('user_details.sso_connectors.connectors'),
              dataIndex: 'name',
              colSpan: 4,
              render: ({ providerLogo, providerLogoDark, branding, name }) => (
                <ConnectorName
                  providerLogo={providerLogo}
                  providerLogoDark={providerLogoDark}
                  branding={branding}
                  name={name}
                />
              ),
            },
            {
              title: t('user_details.sso_connectors.enterprise_id'),
              dataIndex: 'userIdentity',
              colSpan: 6,
              render: ({ identityId }) => (
                <div className={styles.userId}>
                  <span>{identityId || '-'}</span>
                  {identityId && <CopyToClipboard variant="icon" value={identityId} />}
                </div>
              ),
            },
            {
              title: t('user_details.connections.token_status_column'),
              dataIndex: 'tokenStatus',
              colSpan: 4,
              render: ({ tokenStatus: { isTokenStorageSupported, tokenSecret } }) => (
                <ConnectorTokenStatus
                  isTokenStorageSupported={isTokenStorageSupported}
                  tokenSecret={tokenSecret}
                />
              ),
            },
            {
              title: null,
              dataIndex: 'action',
              colSpan: 2,
              render: ({ ssoConnectorId }) => (
                <Button
                  title="general.manage"
                  type="text"
                  size="small"
                  onClick={() => {
                    navigate(`/users/${userId}/sso-identities/${ssoConnectorId}`);
                  }}
                />
              ),
            },
          ]}
        />
      )}
    </FormField>
  );
}

export default UserSsoIdentities;
