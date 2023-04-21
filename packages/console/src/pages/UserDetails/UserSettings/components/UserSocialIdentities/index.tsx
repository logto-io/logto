import type { Identities, ConnectorResponse } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Button from '@/components/Button';
import CopyToClipboard from '@/components/CopyToClipboard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ImageWithErrorFallback from '@/components/ImageWithErrorFallback';
import Table from '@/components/Table';
import UnnamedTrans from '@/components/UnnamedTrans';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import { getConnectorGroups } from '@/pages/Connectors/utils';

import * as styles from './index.module.scss';

type Props = {
  userId: string;
  identities: Identities;
  onDelete?: (connectorId: string) => void;
};

type DisplayConnector = {
  target: ConnectorResponse['target'];
  userId?: string;
  logo?: ConnectorResponse['logo'];
  name: ConnectorResponse['name'] | string;
};

function ConnectorName({ name }: { name: DisplayConnector['name'] }) {
  return typeof name === 'string' ? <span>{name}</span> : <UnnamedTrans resource={name} />;
}

function UserSocialIdentities({ userId, identities, onDelete }: Props) {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<ConnectorResponse[], RequestError>('api/connectors');
  const [deletingConnector, setDeletingConnector] = useState<DisplayConnector>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const connectorGroups = useMemo(() => {
    if (!data?.length) {
      return;
    }

    return getConnectorGroups(data);
  }, [data]);

  const isLoading = !connectorGroups && !error;

  const handleDelete = async (target: string) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.delete(`api/users/${userId}/identities/${target}`);
      onDelete?.(target);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayConnectors = useMemo(() => {
    if (!connectorGroups) {
      return;
    }

    return Object.keys(identities).map((key): DisplayConnector => {
      const { logo, name } = connectorGroups.find((group) => group.target === key) ?? {};
      const socialUserId = identities[key]?.userId;

      return { logo, name: name ?? t('connectors.unknown'), target: key, userId: socialUserId };
    });
  }, [connectorGroups, identities, t]);

  if (Object.keys(identities).length === 0) {
    return <div className={styles.empty}>{t('user_details.connectors.not_connected')}</div>;
  }

  return (
    <div>
      {displayConnectors && (
        <Table
          hasBorder
          rowGroups={[{ key: 'identities', data: displayConnectors }]}
          rowIndexKey="target"
          isLoading={isLoading}
          errorMessage={error?.body?.message ?? error?.message}
          columns={[
            {
              title: t('user_details.connectors.connectors'),
              dataIndex: 'name',
              colSpan: 5,
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
              dataIndex: 'userId',
              colSpan: 8,
              render: ({ userId = '' }) => (
                <div className={styles.connectorId}>
                  <span>{userId || '-'}</span>
                  {userId && <CopyToClipboard variant="icon" value={userId} />}
                </div>
              ),
            },
            {
              title: null,
              dataIndex: 'action',
              colSpan: 3,
              render: (connector) => (
                <Button
                  title="user_details.connectors.remove"
                  type="text"
                  size="small"
                  onClick={() => {
                    setDeletingConnector(connector);
                  }}
                />
              ),
            },
          ]}
          onRetry={async () => mutate(undefined, true)}
        />
      )}
      <DeleteConfirmModal
        isOpen={deletingConnector !== undefined}
        isLoading={isSubmitting}
        onCancel={() => {
          setDeletingConnector(undefined);
        }}
        onConfirm={async () => {
          if (deletingConnector) {
            await handleDelete(deletingConnector.target);
            setDeletingConnector(undefined);
          }
        }}
      >
        {deletingConnector && (
          <Trans
            t={t}
            i18nKey="user_details.connectors.deletion_confirmation"
            components={{
              name: <ConnectorName name={deletingConnector.name} />,
            }}
          />
        )}
      </DeleteConfirmModal>
    </div>
  );
}

export default UserSocialIdentities;
