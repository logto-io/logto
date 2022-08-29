import { useTranslation } from 'react-i18next';

import RadioGroup, { Radio } from '@/components/RadioGroup';
import UnnamedTrans from '@/components/UnnamedTrans';
import { connectorPlatformLabel } from '@/consts/connectors';
import { ConnectorGroup } from '@/types/connector';

import * as styles from './PlatformSelector.module.scss';

type Props = {
  connectorGroup: ConnectorGroup;
  connectorId?: string;
  onConnectorIdChange: (value: string) => void;
};

const PlatformSelector = ({ connectorGroup, connectorId, onConnectorIdChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (connectorGroup.connectors.length <= 1) {
    return null;
  }

  return (
    <div className={styles.platforms}>
      <div className={styles.title}>
        <UnnamedTrans resource={connectorGroup.name} />
        {t('connectors.add_multi_platform')}
      </div>
      <RadioGroup type="plain" name="connector" value={connectorId} onChange={onConnectorIdChange}>
        {connectorGroup.connectors.map(
          ({ platform, id, enabled }) =>
            platform && (
              <Radio
                key={id}
                value={id}
                title={connectorPlatformLabel[platform]}
                isDisabled={enabled}
              />
            )
        )}
      </RadioGroup>
    </div>
  );
};

export default PlatformSelector;
