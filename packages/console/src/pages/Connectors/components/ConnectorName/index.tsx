import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Button from '@/components/Button';
import ItemPreview from '@/components/ItemPreview';
import UnnamedTrans from '@/components/UnnamedTrans';
import {
  connectorIconPlaceHolder,
  connectorPlatformLabel,
  connectorTitlePlaceHolder,
} from '@/consts/connectors';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';

import * as styles from './index.module.scss';

type Props = {
  type: ConnectorType;
  connectors: ConnectorDTO[];
  onClickSetup?: () => void;
};

const ConnectorName = ({ type, connectors, onClickSetup }: Props) => {
  const { t } = useTranslation(undefined);
  const enabledConnectors = connectors.filter(({ enabled }) => enabled);
  const connector = enabledConnectors[0];

  if (!connector) {
    return (
      <ItemPreview
        title={
          <div className={styles.previewTitle}>
            <div>{t(connectorTitlePlaceHolder[type])}</div>
            {type !== ConnectorType.Social && (
              <Button title="admin_console.connectors.set_up" onClick={onClickSetup} />
            )}
          </div>
        }
        icon={
          <div className={styles.logoContainer}>
            <img src={connectorIconPlaceHolder[type]} />
          </div>
        }
      />
    );
  }

  return (
    <Link to={`/connectors/${connector.id}`} className={styles.link}>
      <ItemPreview
        title={<UnnamedTrans resource={connector.name} />}
        subtitle={
          <>
            {type !== ConnectorType.Social && connector.id}
            {type === ConnectorType.Social && enabledConnectors.length > 1 && (
              <div className={styles.platforms}>
                {enabledConnectors.map(
                  ({ id, platform }) =>
                    platform && (
                      <div key={id} className={styles.platform}>
                        <ConnectorPlatformIcon platform={platform} />
                        {t(`admin_console.${connectorPlatformLabel[platform]}`)}
                      </div>
                    )
                )}
              </div>
            )}
          </>
        }
        icon={
          <div className={styles.logoContainer}>
            <img className={styles.logo} src={connector.logo} />
          </div>
        }
      />
    </Link>
  );
};

export default ConnectorName;
