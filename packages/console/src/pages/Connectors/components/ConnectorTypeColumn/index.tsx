import type { ConnectorFactoryResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import UnnamedTrans from '@/components/UnnamedTrans';
import { connectorTitlePlaceHolder } from '@/consts/connectors';
import type { ConnectorGroup } from '@/types/connector';

type Props = {
  connectorGroup: ConnectorGroup;
};

function ConnectorTypeColumn({ connectorGroup: { type, connectors } }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const standardConnectors = connectors.filter(({ isStandard }) => isStandard);

  if (standardConnectors.length > 1) {
    throw new Error('More than one standard connectors with the same target is not supported.');
  }

  const firstStandardConnector = standardConnectors[0];

  const { data: connectorFactory } = useSWR<ConnectorFactoryResponse>(
    firstStandardConnector && `api/connector-factories/${firstStandardConnector.connectorId}`
  );

  if (!firstStandardConnector) {
    return <>{t(connectorTitlePlaceHolder[type])}</>;
  }

  if (!connectorFactory) {
    return null;
  }

  return <UnnamedTrans resource={connectorFactory.name} />;
}

export default ConnectorTypeColumn;
