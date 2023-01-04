import { useTranslation } from 'react-i18next';

import Status from '@/components/Status';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import type { ConnectorGroup } from '@/types/connector';

type Props = {
  connectorGroup: ConnectorGroup;
};

const ConnectorStatus = ({ connectorGroup }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { connectors } = connectorGroup;
  const { isConnectorInUse } = useConnectorInUse();

  const firstConnector = connectors[0];
  const inUse = isConnectorInUse(firstConnector);

  return firstConnector ? (
    <Status status={inUse ? 'enabled' : 'disabled'}>
      {t('connectors.connector_status', {
        context: inUse ? 'in_use' : 'not_in_use',
      })}
    </Status>
  ) : (
    <span>-</span>
  );
};

export default ConnectorStatus;
