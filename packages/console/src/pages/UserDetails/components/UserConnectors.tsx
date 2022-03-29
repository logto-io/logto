import { Languages } from '@logto/phrases';
import { ConnectorDTO, Identities } from '@logto/schemas';
import { Optional } from '@silverhand/essentials';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import TableError from '@/components/Table/TableError';
import UnnamedTrans from '@/components/UnnamedTrans';
import useApi, { RequestError } from '@/hooks/use-api';

import * as styles from './UserConnectors.module.scss';

type Props = {
  userId: string;
  connectors: Identities;
  onDelete?: (connectorId: string) => void;
};

type DisplayConnector = {
  id: string;
  userId?: string;
  logo: string;
  name: Record<Languages, string>;
};

const UserConnectors = ({ userId, connectors, onDelete }: Props) => {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const isLoading = !data && !error;
  const [isSubmiting, setIsSubmiting] = useState(false);

  const handleDelete = async (connectorId: string) => {
    if (isSubmiting) {
      return;
    }

    setIsSubmiting(true);

    try {
      await api.delete(`/api/users/${userId}/identities/${connectorId}`);
      onDelete?.(connectorId);
    } finally {
      setIsSubmiting(false);
    }
  };

  const displayConnectors: Optional<DisplayConnector[]> = useMemo(() => {
    if (!data) {
      return;
    }

    return Object.keys(connectors).map((key) => {
      const connector = data.find(({ id }) => id === key);

      if (!connector) {
        return {
          logo: '',
          name: {
            'zh-CN': '未知连接器',
            en: 'Unknown Connector',
          },
          id: key,
          userId: connectors[key]?.userId,
        };
      }

      const { logo, name } = connector.metadata;

      return {
        logo,
        name,
        id: key,
        userId: connectors[key]?.userId,
      };
    });
  }, [data, connectors]);

  return (
    <div>
      {isLoading && <div>Loading</div>}
      {displayConnectors && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('user_details.connectors.connectors')}</th>
              <th>{t('user_details.connectors.user_id')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {error && (
              <TableError
                columns={3}
                content={error.body.message}
                onRetry={async () => mutate(undefined, true)}
              />
            )}
            {displayConnectors.length === 0 && (
              <tr>
                <td rowSpan={3}>{t('user_details.connectors.not_connected')}</td>
              </tr>
            )}
            {displayConnectors.map((connector) => (
              <tr key={connector.id}>
                <td>
                  <div className={styles.connectorName}>
                    <div>
                      {connector.logo.startsWith('http') ? (
                        <img src={connector.logo} />
                      ) : (
                        <ImagePlaceholder size={32} />
                      )}
                    </div>
                    <div className={styles.name}>
                      <UnnamedTrans resource={connector.name} />
                    </div>
                  </div>
                </td>
                <td>{connector.userId}</td>
                <td>
                  <Button
                    title="admin_console.user_details.connectors.remove"
                    type="plain"
                    onClick={() => {
                      void handleDelete(connector.id);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserConnectors;
