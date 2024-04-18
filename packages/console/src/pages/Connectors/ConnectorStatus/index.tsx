import { useTranslation } from 'react-i18next';

import Tag from '@/ds-components/Tag';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import type { ConnectorGroup } from '@/types/connector';

type Props = {
  readonly connectorGroup: ConnectorGroup;
};

function ConnectorStatus({ connectorGroup }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { connectors } = connectorGroup;
  const { isConnectorInUse } = useConnectorInUse();

  const firstConnector = connectors[0];
  const inUse = isConnectorInUse(firstConnector);

  return firstConnector ? (
    <Tag type="state" status={inUse ? 'success' : 'info'} variant="plain">
      {t(inUse ? 'connectors.connector_status_in_use' : 'connectors.connector_status_not_in_use')}
    </Tag>
  ) : (
    <span>-</span>
  );
}

export default ConnectorStatus;
