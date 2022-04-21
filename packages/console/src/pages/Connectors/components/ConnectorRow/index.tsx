import { ConnectorDTO } from '@logto/connector-types';
import { ConnectorType } from '@logto/schemas';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Status from '@/components/Status';

import ConnectorName from '../ConnectorName';

type Props = {
  type: ConnectorType;
  connector?: ConnectorDTO;
  onClickSetup?: () => void;
};

const ConnectorRow = ({ type, connector, onClickSetup }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const typeLabel = useMemo(() => {
    if (type === ConnectorType.Email) {
      return t('connectors.type.email');
    }

    if (type === ConnectorType.SMS) {
      return t('connectors.type.sms');
    }

    return t('connectors.type.social');
  }, [type, t]);

  return (
    <tr>
      <td>
        <ConnectorName connector={connector} titlePlaceholder={typeLabel} />
      </td>
      <td>{typeLabel}</td>
      <td>
        {type === ConnectorType.Social && (
          <Status status={connector?.enabled ? 'enabled' : 'disabled'}>
            {t(
              connector?.enabled
                ? 'connectors.connector_status_enabled'
                : 'connectors.connector_status_disabled'
            )}
          </Status>
        )}
        {type !== ConnectorType.Social && connector && (
          <Status status="enabled">{t('connectors.connector_status_enabled')}</Status>
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
