import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Status from '@/components/Status';
import { connectorTitlePlaceHolder } from '@/consts/connectors';

import ConnectorName from '../ConnectorName';

type Props = {
  type: ConnectorType;
  connector?: ConnectorDTO;
  onClickSetup?: () => void;
};

const ConnectorRow = ({ type, connector, onClickSetup }: Props) => {
  const { t } = useTranslation(undefined);

  return (
    <tr>
      <td>
        <ConnectorName type={type} connector={connector} />
      </td>
      <td>{t(connectorTitlePlaceHolder[type])}</td>
      <td>
        {type === ConnectorType.Social && (
          <Status status={connector?.enabled ? 'enabled' : 'disabled'}>
            {t(
              connector?.enabled
                ? 'admin_console.connectors.connector_status_enabled'
                : 'admin_console.connectors.connector_status_disabled'
            )}
          </Status>
        )}
        {type !== ConnectorType.Social && connector && (
          <Status status="enabled">{t('admin_console.connectors.connector_status_enabled')}</Status>
        )}
        {type !== ConnectorType.Social && !connector && (
          <Button
            title="admin_console.connectors.set_up"
            type="outline"
            onClick={() => {
              onClickSetup?.();
            }}
          />
        )}
      </td>
    </tr>
  );
};

export default ConnectorRow;
