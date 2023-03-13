import type { ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import Delete from '@/assets/images/delete.svg';
import ConfirmModal from '@/components/ConfirmModal';
import IconButton from '@/components/IconButton';
import { Tooltip } from '@/components/Tip';
import UnnamedTrans from '@/components/UnnamedTrans';
import useApi from '@/hooks/use-api';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import type { ConnectorGroup } from '@/types/connector';

type Props = {
  connectorGroup: ConnectorGroup;
};

const ConnectorDeleteButton = ({ connectorGroup }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { mutate: mutateGlobal } = useSWRConfig();
  const { connectors } = connectorGroup;
  const { isConnectorInUse } = useConnectorInUse();

  const firstConnector = connectors[0];
  const isSocial = firstConnector?.type === ConnectorType.Social;
  const inUse = isConnectorInUse(firstConnector);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const api = useApi();

  const onDeleteClick = async () => {
    if (!isSocial || !inUse) {
      await handleDelete();

      return;
    }

    setIsDeleteAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!firstConnector) {
      return;
    }

    const { connectors } = connectorGroup;

    await Promise.all(
      connectors.map(async (connector) => {
        await api.delete(`api/connectors/${connector.id}`).json<ConnectorResponse>();
      })
    );

    toast.success(t('connector_details.connector_deleted'));
    await mutateGlobal('api/connectors');
  };

  if (!firstConnector) {
    return null;
  }

  return (
    <>
      <Tooltip content={<div>{t('general.delete')}</div>}>
        <IconButton onClick={onDeleteClick}>
          <Delete />
        </IconButton>
      </Tooltip>
      <ConfirmModal
        isOpen={isDeleteAlertOpen}
        confirmButtonText="general.delete"
        onCancel={() => {
          setIsDeleteAlertOpen(false);
        }}
        onConfirm={handleDelete}
      >
        <Trans
          t={t}
          i18nKey="connector_details.in_use_deletion_description"
          components={{ name: <UnnamedTrans resource={firstConnector.name} /> }}
        />
      </ConfirmModal>
    </>
  );
};

export default ConnectorDeleteButton;
