import { ConnectorPlatform, ConnectorType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import ConnectorLogo from '@/components/ConnectorLogo';
import ItemPreview from '@/components/ItemPreview';
import UnnamedTrans from '@/components/UnnamedTrans';
import {
  connectorPlaceholderIcon,
  connectorPlatformLabel,
  connectorTitlePlaceHolder,
} from '@/consts/connectors';
import { ConnectorsTabs } from '@/consts/page-tabs';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';
import type { ConnectorGroup } from '@/types/connector';

import * as styles from './index.module.scss';

type Props = {
  connectorGroup: ConnectorGroup;
};

const ConnectorName = ({ connectorGroup }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { type, connectors } = connectorGroup;
  const connector = connectors[0];
  const navigate = useNavigate();
  const hasNonUniversalConnector = connectors.some(
    ({ platform }) => platform !== ConnectorPlatform.Universal
  );

  if (!connector) {
    const PlaceholderIcon = connectorPlaceholderIcon[type];

    return (
      <ItemPreview
        title={
          <div className={styles.previewTitle}>
            <div>{t(connectorTitlePlaceHolder[type])}</div>
            {type !== ConnectorType.Social && (
              <Button
                title="general.set_up"
                onClick={() => {
                  navigate(`/connectors/${ConnectorsTabs.Passwordless}/create/${type}`);
                }}
              />
            )}
          </div>
        }
        icon={
          <div className={styles.logoContainer}>
            {PlaceholderIcon && <PlaceholderIcon className={styles.logo} />}
          </div>
        }
      />
    );
  }

  return (
    <ItemPreview
      title={<UnnamedTrans resource={connector.name} />}
      subtitle={
        <>
          {type !== ConnectorType.Social && connector.id}
          {type === ConnectorType.Social && hasNonUniversalConnector && (
            <div className={styles.platforms}>
              {connectors.map(
                ({ id, platform }) =>
                  platform && (
                    <div key={id} className={styles.platform}>
                      <ConnectorPlatformIcon platform={platform} />
                      {t(`${connectorPlatformLabel[platform]}`)}
                    </div>
                  )
              )}
            </div>
          )}
        </>
      }
      icon={<ConnectorLogo data={connector} />}
      to={`/connectors/${
        connector.type === ConnectorType.Social
          ? ConnectorsTabs.Social
          : ConnectorsTabs.Passwordless
      }/${connector.id}`}
    />
  );
};

export default ConnectorName;
