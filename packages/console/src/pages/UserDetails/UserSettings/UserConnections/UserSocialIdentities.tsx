import type {
  ConnectorResponse,
  GetUserAllIdentitiesResponse,
  DesensitizedSocialTokenSetSecret,
} from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import ConnectorLogo from '@/components/ConnectorLogo';
import ConnectorName from '@/components/ConnectorName';
import ConnectorTokenStatus from '@/components/ConnectorTokenStatus';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import type { RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { getConnectorGroups } from '@/pages/Connectors/utils';

import styles from './index.module.scss';

type Props = {
  readonly userId: string;
};

type RowData = {
  target: ConnectorResponse['target'];
  identityId?: string;
  logo?: ConnectorResponse['logo'];
  logoDark?: ConnectorResponse['logoDark'];
  name: ConnectorResponse['name'] | string;
  tokenStatus: {
    isTokenStorageSupported?: boolean;
    tokenSecret?: DesensitizedSocialTokenSetSecret;
  };
};

function UserSocialIdentities({ userId }: Props) {
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
    data: connectors,
    error: connectorsError,
    isLoading: isConnectorsLoading,
    mutate,
  } = useSWR<ConnectorResponse[], RequestError>('api/connectors');

  const isLoading = isIdentitiesLoading || isConnectorsLoading;
  const error = identitiesError ?? connectorsError;

  const identities = useMemo(() => data?.socialIdentities ?? [], [data]);

  const rowData = useMemo(() => {
    if (!connectors?.length) {
      return;
    }

    const connectorGroups = getConnectorGroups(connectors);

    return identities.map(({ identity, tokenSecret, target }): RowData => {
      const { logo, logoDark, name, isTokenStorageSupported } =
        connectorGroups.find((group) => group.target === target) ?? {};

      return {
        logo,
        logoDark,
        name: name ?? t('connectors.unknown'),
        target,
        identityId: identity.userId,
        tokenStatus: {
          isTokenStorageSupported,
          tokenSecret,
        },
      };
    });
  }, [connectors, identities, t]);

  const hasRows = Boolean(rowData && rowData.length > 0);

  return (
    <FormField title="user_details.field_connectors">
      {!isLoading && !error && (
        <div className={styles.description}>
          {t(
            hasRows ? 'user_details.connectors.connected' : 'user_details.connectors.not_connected'
          )}
        </div>
      )}
      {(isLoading || hasRows || error) && (
        <Table
          hasBorder
          isRowHoverEffectDisabled
          rowGroups={[{ key: 'identities', data: rowData }]}
          rowIndexKey="target"
          isLoading={isLoading}
          errorMessage={error?.body?.message ?? error?.message}
          columns={[
            {
              title: t('user_details.connectors.connectors'),
              dataIndex: 'name',
              colSpan: 4,
              render: ({ logo = '', logoDark = '', name }) => (
                <div className={styles.connectorName}>
                  <ConnectorLogo data={{ logo, logoDark }} size="small" />
                  <div className={styles.name}>
                    <ConnectorName name={name} />
                  </div>
                </div>
              ),
            },
            {
              title: t('user_details.connectors.user_id'),
              dataIndex: 'identityId',
              colSpan: 6,
              render: ({ identityId = '' }) => (
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
              render: ({ target }) => (
                <Button
                  title="general.manage"
                  type="text"
                  size="small"
                  onClick={() => {
                    navigate(`/users/${userId}/social-identities/${target}`);
                  }}
                />
              ),
            },
          ]}
          onRetry={async () => mutate(undefined, true)}
        />
      )}
    </FormField>
  );
}

export default UserSocialIdentities;
