import { ConnectorDTO } from '@logto/schemas';
import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';

import * as styles from './index.module.scss';

type Props = {
  target: string;
  connectorId: string;
};

const ConnectorTabs = ({ target, connectorId }: Props) => {
  const { data } = useSWR<ConnectorDTO[]>(`/api/connectors?target=${target}`);

  if (!data) {
    return null;
  }

  return (
    <div className={styles.tabs}>
      {data
        .filter(({ enabled }) => enabled)
        .map((connector) => (
          <Link
            key={connector.id}
            to={`/connectors/${connector.id}`}
            className={classNames(styles.tab, connector.id === connectorId && styles.active)}
          >
            {connector.platform && (
              <div className={styles.icon}>
                <ConnectorPlatformIcon platform={connector.platform} />
              </div>
            )}
            {connector.platform}
          </Link>
        ))}
    </div>
  );
};

export default ConnectorTabs;
