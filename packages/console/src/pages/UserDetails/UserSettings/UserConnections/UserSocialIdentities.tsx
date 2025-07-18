import type {
  ConnectorResponse,
  GetUserAllIdentitiesResponse,
  DesensitizedSocialTokenSetSecret,
} from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import UnnamedTrans from '@/components/UnnamedTrans';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import Table from '@/ds-components/Table';
import type { RequestError } from '@/hooks/use-api';
import { getConnectorGroups } from '@/pages/Connectors/utils';

import ConnectorTokenStatus from './ConnectorTokenStatus';
import styles from './index.module.scss';

type Props = {
  readonly identities?: GetUserAllIdentitiesResponse['socialIdentities'];
  readonly isIdentitiesLoading?: boolean;
};

type RowData = {
  target: ConnectorResponse['target'];
  identityId?: string;
  logo?: ConnectorResponse['logo'];
  name: ConnectorResponse['name'] | string;
  tokenStatus: {
    isTokenStorageSupported?: boolean;
    tokenSecret?: DesensitizedSocialTokenSetSecret;
  };
};

function ConnectorName({ name }: { readonly name: RowData['name'] }) {
  return typeof name === 'string' ? <span>{name}</span> : <UnnamedTrans resource={name} />;
}

function UserSocialIdentities({ isIdentitiesLoading, identities = [] }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const {
    data: connectors,
    error,
    isLoading,
    mutate,
  } = useSWR<ConnectorResponse[], RequestError>('api/connectors');

  const isDataLoading = useMemo(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    () => isIdentitiesLoading || isLoading,
    [isIdentitiesLoading, isLoading]
  );

  const connectorGroups = useMemo(() => {
    if (!connectors?.length) {
      return;
    }

    return getConnectorGroups(connectors);
  }, [connectors]);

  const rowData = useMemo(() => {
    if (!connectorGroups) {
      return;
    }

    return identities.map(({ identity, tokenSecret, target }): RowData => {
      const { logo, name, isTokenStorageSupported } =
        connectorGroups.find((group) => group.target === target) ?? {};

      return {
        logo,
        name: name ?? t('connectors.unknown'),
        target,
        identityId: identity.userId,
        tokenStatus: {
          isTokenStorageSupported,
          tokenSecret,
        },
      };
    });
  }, [connectorGroups, identities, t]);

  const hasRows = Boolean(rowData && rowData.length > 0);

  return (
    <FormField title="user_details.field_connectors">
      {!isDataLoading && !error && (
        <div className={styles.description}>
          {t(
            hasRows ? 'user_details.connectors.connected' : 'user_details.connectors.not_connected'
          )}
        </div>
      )}
      <Table
        hasBorder
        rowGroups={[{ key: 'identities', data: rowData }]}
        rowIndexKey="target"
        isLoading={isDataLoading}
        errorMessage={error?.body?.message ?? error?.message}
        columns={[
          {
            title: t('user_details.connectors.connectors'),
            dataIndex: 'name',
            colSpan: 4,
            render: ({ logo, name }) => (
              <div className={styles.connectorName}>
                <ImageWithErrorFallback className={styles.icon} src={logo} alt="logo" />
                <div className={styles.name}>
                  <ConnectorName name={name} />
                </div>
              </div>
            ),
          },
          {
            title: t('user_details.connectors.user_id'),
            dataIndex: 'identityId',
            colSpan: 7,
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
            colSpan: 3,
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
                  // TODO
                }}
              />
            ),
          },
        ]}
        onRetry={async () => mutate(undefined, true)}
      />
    </FormField>
  );
}

export default UserSocialIdentities;
