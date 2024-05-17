import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg';
import DeleteConnectorConfirmModal from '@/components/DeleteConnectorConfirmModal';
import IconButton from '@/ds-components/IconButton';
import { Tooltip } from '@/ds-components/Tip';
import useApi from '@/hooks/use-api';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import type { ConnectorGroup } from '@/types/connector';

type Props = {
  readonly connectorGroup: ConnectorGroup;
};

function ConnectorDeleteButton({ connectorGroup }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { mutate: mutateGlobal } = useSWRConfig();
  const { connectors } = connectorGroup;
  const { isConnectorInUse } = useConnectorInUse();

  const firstConnector = connectors[0];
  const inUse = isConnectorInUse(firstConnector);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();

  const handleDelete = async () => {
    if (!firstConnector || isDeleting) {
      return;
    }
    setIsDeleting(true);

    const { connectors } = connectorGroup;

    try {
      await Promise.all(
        connectors.map(async (connector) => {
          await api.delete(`api/connectors/${connector.id}`);
        })
      );

      toast.success(t('connector_details.connector_deleted'));
      await mutateGlobal('api/connectors');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!firstConnector) {
    return null;
  }

  return (
    <>
      <Tooltip content={<div>{t('general.delete')}</div>}>
        <IconButton
          onClick={() => {
            setIsDeleteAlertOpen(true);
          }}
        >
          <Delete />
        </IconButton>
      </Tooltip>
      <DeleteConnectorConfirmModal
        data={firstConnector}
        isInUse={inUse}
        isOpen={isDeleteAlertOpen}
        isLoading={isDeleting}
        onCancel={() => {
          setIsDeleteAlertOpen(false);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default ConnectorDeleteButton;
