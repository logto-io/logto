import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import Status from '@/components/Status';
import { connectorPlatformLabel, connectorTitlePlaceHolder } from '@/consts/connectors';

import ConnectorName from '../ConnectorName';
import * as styles from './index.module.scss';

type Props = {
  type: ConnectorType;
  connectors: ConnectorDTO[];
  onClickSetup?: () => void;
};

const ConnectorRow = ({ type, connectors, onClickSetup }: Props) => {
  const { t } = useTranslation(undefined);

  return (
    <tr>
      <td>
        <ConnectorName
          type={type}
          connector={connectors[0]}
          isShowId={type !== ConnectorType.Social}
        />
      </td>
      <td>{t(connectorTitlePlaceHolder[type])}</td>
      <td>
        {type === ConnectorType.Social && (
          <div className={styles.statusItems}>
            {connectors.map(({ id, enabled, platform }) => {
              const status = enabled ? 'enabled' : 'disabled';

              return (
                <div key={id} className={styles.statusItem}>
                  <Status status={enabled ? 'enabled' : 'disabled'}>
                    {t(`admin_console.connectors.connector_status_${status}`)}
                  </Status>
                  <div className={styles.platform}>
                    {platform && t(connectorPlatformLabel[platform])}
                  </div>
                  <div className={styles.line} />
                </div>
              );
            })}
          </div>
        )}
        {type !== ConnectorType.Social && connectors[0] && (
          <Status status="enabled">{t('admin_console.connectors.connector_status_enabled')}</Status>
        )}
        {type !== ConnectorType.Social && !connectors[0] && (
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
