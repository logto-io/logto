import { ConnectorResponse, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Status from '@/components/Status';
import { connectorTitlePlaceHolder } from '@/consts/connectors';
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
  const firstEnabledConnector = connectors.find(({ enabled }) => enabled);
  const inUse = useConnectorInUse(type, firstEnabledConnector?.target);
  const navigate = useNavigate();
  const showSetupButton = type !== ConnectorType.Social && !firstEnabledConnector;

  const handleClickRow = () => {
    if (showSetupButton || !firstEnabledConnector) {
      return;
    }

    navigate(`/connectors/${firstEnabledConnector.id}`);
  };

  return (
    <tr className={conditional(!showSetupButton && tableStyles.clickable)} onClick={handleClickRow}>
      <td>
        <ConnectorName type={type} connectors={connectors} onClickSetup={onClickSetup} />
      </td>
      <td>{t(connectorTitlePlaceHolder[type])}</td>
      <td>
        {inUse !== undefined && (
          <Status status={inUse ? 'enabled' : 'disabled'}>
            {t('connectors.connector_status', {
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
