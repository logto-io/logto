import { Language } from '@logto/phrases';
import { ConnectorDTO, Identities } from '@logto/schemas';
import { Optional } from '@silverhand/essentials';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import CopyToClipboard from '@/components/CopyToClipboard';
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
  name: Record<Language, string>;
};

const UserConnectors = ({ userId, connectors, onDelete }: Props) => {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<ConnectorDTO[], RequestError>('/api/connectors');
  const isLoading = !data && !error;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (connectorId: string) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.delete(`/api/users/${userId}/identities/${connectorId}`);
      onDelete?.(connectorId);
    } finally {
      setIsSubmitting(false);
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

      const { logo, name } = connector;

      return {
        logo,
        name,
        id: key,
        userId: connectors[key]?.userId,
      };
    });
  }, [data, connectors]);

  if (Object.keys(connectors).length === 0) {
    return <div className={styles.empty}>{t('user_details.connectors.not_connected')}</div>;
  }

  return (
    <div>
      {isLoading && <div>Loading</div>}
      {displayConnectors && (
        <table className={styles.table}>
          <colgroup>
            <col width="156px" />
            <col />
            <col width="110px" />
          </colgroup>
          <thead>
            <tr>
              <th>{t('user_details.connectors.connectors')}</th>
              <th>{t('user_details.connectors.user_id')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!data && error && (
              <TableError
                columns={3}
                content={error.body?.message ?? error.message}
                onRetry={async () => mutate(undefined, true)}
              />
            )}
            {displayConnectors.map(({ id, userId = '', name, logo }) => (
              <tr key={id}>
                <td>
                  <div className={styles.connectorName}>
                    <img src={logo} />
                    <div className={styles.name}>
                      <UnnamedTrans resource={name} />
                    </div>
                  </div>
                </td>
                <td className={styles.connectorId}>
                  <span>{userId || '-'}</span>
                  <CopyToClipboard variant="icon" value={userId} />
                </td>
                <td>
                  <Button
                    title="admin_console.user_details.connectors.remove"
                    type="plain"
                    onClick={() => {
                      void handleDelete(id);
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
