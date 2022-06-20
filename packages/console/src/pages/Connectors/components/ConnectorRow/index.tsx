import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Status from '@/components/Status';
import { connectorTitlePlaceHolder } from '@/consts/connectors';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import * as tableStyles from '@/scss/table.module.scss';

import ConnectorName from '../ConnectorName';

type Props = {
  type: ConnectorType;
  connectors: ConnectorDTO[];
  onClickSetup?: () => void;
};

const ConnectorRow = ({ type, connectors, onClickSetup }: Props) => {
  const { t } = useTranslation(undefined);
  const inUse = useConnectorInUse(type, connectors[0]?.target);
  const navigate = useNavigate();
  const showSetupButton = type !== ConnectorType.Social && !connectors[0];

  const handleClickRow = () => {
    if (showSetupButton || !connectors[0]) {
      return;
    }

    navigate(`/connectors/${connectors[0].id}`);
  };

  return (
    <tr className={conditional(showSetupButton && tableStyles.clickable)} onClick={handleClickRow}>
      <td>
        <ConnectorName type={type} connectors={connectors} onClickSetup={onClickSetup} />
      </td>
      <td>{t(connectorTitlePlaceHolder[type])}</td>
      <td>
        {inUse !== undefined && (
          <Status status={inUse ? 'enabled' : 'disabled'}>
            {t('admin_console.connectors.connector_status', {
              context: inUse ? 'in_use' : 'not_in_use',
            })}
          </Status>
        )}
        {inUse === undefined && !connectors[0] && '-'}
      </td>
    </tr>
  );
};

export default ConnectorRow;
