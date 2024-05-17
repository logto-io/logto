import type { ConnectorFactoryResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import UnnamedTrans from '@/components/UnnamedTrans';
import { connectorPlatformLabel } from '@/consts/connectors';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import type { ConnectorGroup } from '@/types/connector';

import * as styles from './index.module.scss';

type Props = {
  readonly connectorGroup: ConnectorGroup<ConnectorFactoryResponse & { added: boolean }>;
  readonly connectorId?: string;
  readonly onConnectorIdChange: (value: string) => void;
};

function PlatformSelector({ connectorGroup, connectorId, onConnectorIdChange }: Props) {
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
          ({ platform, id, added }) =>
            platform && (
              <Radio
                key={id}
                value={id}
                title={connectorPlatformLabel[platform]}
                isDisabled={added}
              />
            )
        )}
      </RadioGroup>
    </div>
  );
}

export default PlatformSelector;
