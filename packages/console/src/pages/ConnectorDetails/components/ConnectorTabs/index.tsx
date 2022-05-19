import { ConnectorDTO, ConnectorPlatform } from '@logto/schemas';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import Native from '@/icons/Native';
import Universal from '@/icons/Universal';
import Web from '@/icons/Web';

import * as styles from './index.module.scss';

type Props = {
  target: string;
  connectorId: string;
};

const ConnectorTabs = ({ target, connectorId }: Props) => {
  const { data } = useSWR<ConnectorDTO[]>(`/api/connectors?target=${target}`);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (!data) {
    return null;
  }

  return (
    <div className={styles.tabs}>
      {data.map((connector) => (
        <Link
          key={connector.id}
          to={`/connectors/${connector.id}`}
          className={classNames(styles.tab, connector.id === connectorId && styles.active)}
        >
          <div className={styles.icon}>
            {connector.platform === ConnectorPlatform.Native && <Native />}
            {connector.platform === ConnectorPlatform.Web && <Web />}
            {connector.platform === ConnectorPlatform.Universal && <Universal />}
          </div>
          {connector.metadata.platform}
          {!connector.enabled && (
            <div className={styles.notSet}>{t('connector_details.not_set')}</div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default ConnectorTabs;
