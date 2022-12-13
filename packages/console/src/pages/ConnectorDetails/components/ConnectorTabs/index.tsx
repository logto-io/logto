import type { ConnectorResponse } from '@logto/schemas';
import { ConnectorPlatform } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import { connectorPlatformLabel } from '@/consts';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';

import * as styles from './index.module.scss';

type Props = {
  target: string;
  connectorId: string;
};

const ConnectorTabs = ({ target, connectorId }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data: connectors } = useSWR<ConnectorResponse[]>(`/api/connectors?target=${target}`);

  if (!connectors) {
    return null;
  }

  if (connectors.length === 0) {
    return null;
  }

  if (connectors.length === 1 && connectors[0]?.platform === ConnectorPlatform.Universal) {
    return null;
  }

  return (
    <div className={styles.tabs}>
      {connectors.map((connector) => (
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
          {connector.platform && t(connectorPlatformLabel[connector.platform])}
        </Link>
      ))}
    </div>
  );
};

export default ConnectorTabs;
