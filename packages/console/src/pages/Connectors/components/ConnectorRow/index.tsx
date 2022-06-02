import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Status from '@/components/Status';
import { connectorTitlePlaceHolder } from '@/consts/connectors';
import useConnectorInUse from '@/hooks/use-connector-in-use';

import ConnectorName from '../ConnectorName';

type Props = {
  type: ConnectorType;
  connectors: ConnectorDTO[];
  onClickSetup?: () => void;
};

const ConnectorRow = ({ type, connectors, onClickSetup }: Props) => {
  const { t } = useTranslation(undefined);
  const inUse = useConnectorInUse(
    conditional(type === ConnectorType.Social && connectors[0]?.target)
  );

  return (
    <tr>
      <td>
        <ConnectorName
          type={type}
          connector={connectors[0]}
          isShowId={type !== ConnectorType.Social}
          onClickSetup={onClickSetup}
        />
      </td>
      <td>{t(connectorTitlePlaceHolder[type])}</td>
      <td>
        {type === ConnectorType.Social && inUse !== undefined && (
          <Status status={inUse ? 'enabled' : 'disabled'}>
            {t('admin_console.connectors.connector_status', {
              context: inUse ? 'in_use' : 'not_in_use',
            })}
          </Status>
        )}
        {type !== ConnectorType.Social && connectors[0] && (
          <Status status="enabled">{t('admin_console.connectors.connector_status_in_use')}</Status>
        )}
        {type !== ConnectorType.Social && !connectors[0] && '-'}
      </td>
    </tr>
  );
};

export default ConnectorRow;
