import type { Identities, ConnectorResponse } from '@logto/schemas';
import type { Optional } from '@silverhand/essentials';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import CopyToClipboard from '@/components/CopyToClipboard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import TableError from '@/components/Table/TableError';
import UnnamedTrans from '@/components/UnnamedTrans';
import useApi from '@/hooks/use-api';
import useConnectorGroups from '@/hooks/use-connector-groups';

import * as styles from './UserConnectors.module.scss';

type Props = {
  userId: string;
  connectors: Identities;
  onDelete?: (connectorId: string) => void;
};

type DisplayConnector = Pick<ConnectorResponse, 'target' | 'logo' | 'name'> & { userId?: string };

const UserConnectors = ({ userId, connectors, onDelete }: Props) => {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: connectorGroups, error, mutate } = useConnectorGroups();
  const [deletingConnector, setDeletingConnector] = useState<DisplayConnector>();
  const isLoading = !connectorGroups && !error;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async (target: string) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.delete(`/api/users/${userId}/identities/${target}`);
      onDelete?.(target);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayConnectors: Optional<DisplayConnector[]> = useMemo(() => {
    if (!connectorGroups) {
      return;
    }

    return Object.keys(connectors).map((key) => {
      const connector = connectorGroups.find(({ target }) => target === key);

      if (!connector) {
        return {
          logo: '',
          name: {
            'zh-CN': '未知连接器',
            en: 'Unknown Connector',
            'tr-TR': 'Bilinmeyen connector.',
            'ko-KR': '알수없는 연동',
          },
          target: key,
          userId: connectors[key]?.userId,
        };
      }

      const { logo, name } = connector;

      return {
        logo,
        name,
        target: key,
        userId: connectors[key]?.userId,
      };
    });
  }, [connectorGroups, connectors]);

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
            {!connectorGroups && error && (
              <TableError
                columns={3}
                content={error.body?.message ?? error.message}
                onRetry={async () => mutate(undefined, true)}
              />
            )}
            {displayConnectors.map((connector) => {
              const { target, userId = '', name, logo } = connector;

              return (
                <tr key={target}>
                  <td>
                    <div className={styles.connectorName}>
                      <img src={logo} alt="logo" />
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
                      title="user_details.connectors.remove"
                      type="text"
                      size="small"
                      onClick={() => {
                        setDeletingConnector(connector);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <DeleteConfirmModal
        isOpen={deletingConnector !== undefined}
        onCancel={() => {
          setDeletingConnector(undefined);
        }}
        onConfirm={async () => {
          if (deletingConnector !== undefined) {
            await handleDelete(deletingConnector.target);
            setDeletingConnector(undefined);
          }
        }}
      >
        {deletingConnector && (
          <Trans
            t={t}
            i18nKey="user_details.connectors.deletion_confirmation"
            components={{ name: <UnnamedTrans resource={deletingConnector.name} /> }}
          />
        )}
      </DeleteConfirmModal>
    </div>
  );
};

export default UserConnectors;
