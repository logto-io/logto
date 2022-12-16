import type { ConnectorResponse } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Status from '@/components/Status';
import { connectorTitlePlaceHolder } from '@/consts/connectors';
import useConnectorInUse from '@/hooks/use-connector-in-use';
import * as tableStyles from '@/scss/table.module.scss';
import { getConnectorDetailsPathname } from '@/utilities/router';

import ConnectorName from '../ConnectorName';

type Props = {
  type: ConnectorType;
  connectors: ConnectorResponse[];
  onClickSetup?: () => void;
};

const ConnectorRow = ({ type, connectors, onClickSetup }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const firstConnector = connectors[0];
  const inUse = useConnectorInUse(type, firstConnector?.target);
  const navigate = useNavigate();
  const showSetupButton = type !== ConnectorType.Social && !firstConnector;

  const handleClickRow = () => {
    if (showSetupButton || !firstConnector) {
      return;
    }

    navigate(getConnectorDetailsPathname(type, firstConnector.id));
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
