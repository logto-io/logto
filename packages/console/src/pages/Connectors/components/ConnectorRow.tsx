import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Status from '@/components/Status';

import * as styles from '../index.module.scss';
import ConnectorName from './ConnectorName';

type Props = {
  type: ConnectorType;
  connector?: ConnectorDTO;
};

const ConnectorRow = ({ type, connector }: Props) => {
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
      <td className={styles.connectorName}>
        <ConnectorName connector={connector} titlePlaceholder={typeLabel} />
      </td>
      <td>{typeLabel}</td>
      <td>
        {type === ConnectorType.Social && (
          <Status status={connector?.enabled ? 'operational' : 'offline'}>
            {t(
              connector?.enabled
                ? 'connectors.connector_status_enabled'
                : 'connectors.connector_status_disabled'
            )}
          </Status>
        )}
        {type !== ConnectorType.Social && connector && (
          <Status status="operational">{t('connectors.connector_status_enabled')}</Status>
        )}
        {type !== ConnectorType.Social && !connector && (
          <Button title="admin_console.connectors.set_up" type="primary" />
        )}
      </td>
    </tr>
  );
};

export default ConnectorRow;
