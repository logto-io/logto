import type { ConnectorFactoryResponse, ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import Status from '@/components/Status';
import UnnamedTrans from '@/components/UnnamedTrans';
import { connectorTitlePlaceHolder } from '@/consts/connectors';
import { ConnectorsTabs } from '@/consts/page-tabs';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import * as tableStyles from '@/scss/table.module.scss';

import ConnectorName from '../ConnectorName';

type Props = {
  type: ConnectorType;
  connectors: ConnectorResponse[];
  onClickSetup?: () => void;
};

const ConnectorRow = ({ type, connectors, onClickSetup }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const firstConnector = connectors[0];
  const { isConnectorInUse } = useConnectorInUse();
  const inUse = isConnectorInUse(firstConnector);
  const navigate = useNavigate();
  const showSetupButton = type !== ConnectorType.Social && !firstConnector;

  const standardConnectors = connectors.filter(({ isStandard }) => isStandard);

  if (standardConnectors.length > 1) {
    throw new Error('More than one standard connectors with the same target is not supported.');
  }
  const firstStandardConnector = standardConnectors[0];
  const { data: connectorFactory } = useSWR<ConnectorFactoryResponse>(
    firstStandardConnector && `/api/connector-factories/${firstStandardConnector.connectorId}`
  );

  const handleClickRow = () => {
    if (showSetupButton || !firstConnector) {
      return;
    }

    navigate(
      `/connectors/${
        firstConnector.type === ConnectorType.Social
          ? ConnectorsTabs.Social
          : ConnectorsTabs.Passwordless
      }/${firstConnector.id}`
    );
  };

  const connectorTypeColumn = useMemo(() => {
    if (!firstStandardConnector) {
      return t(connectorTitlePlaceHolder[type]);
    }

    return connectorFactory && <UnnamedTrans resource={connectorFactory.name} />;
  }, [type, connectorFactory, t, firstStandardConnector]);

  return (
    <tr className={conditional(!showSetupButton && tableStyles.clickable)} onClick={handleClickRow}>
      <td>
        <ConnectorName type={type} connectors={connectors} onClickSetup={onClickSetup} />
      </td>
      <td>{connectorTypeColumn}</td>
      <td>
        {conditional(
          firstConnector && (
            <Status status={inUse ? 'enabled' : 'disabled'}>
              {t('connectors.connector_status', {
                context: inUse ? 'in_use' : 'not_in_use',
              })}
            </Status>
          )
        ) ?? '-'}
      </td>
    </tr>
  );
};

export default ConnectorRow;
