import Draggable from '@/assets/icons/draggable.svg';
import Minus from '@/assets/icons/minus.svg';
import ConnectorLogo from '@/components/ConnectorLogo';
import UnnamedTrans from '@/components/UnnamedTrans';
import IconButton from '@/ds-components/IconButton';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';
import type { ConnectorGroup } from '@/types/connector';

import * as styles from './index.module.scss';

type Props = {
  readonly data: ConnectorGroup;
  readonly onDelete: (connectorTarget: string) => void;
};

function SelectedConnectorItem({
  data: { logo, logoDark, target, name, connectors },
  onDelete,
}: Props) {
  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <Draggable className={styles.draggableIcon} />
        <ConnectorLogo data={{ logo, logoDark }} size="small" />
        <UnnamedTrans resource={name} className={styles.name} />
        {connectors.length > 1 &&
          connectors.map(({ platform }) => (
            <div key={platform} className={styles.icon}>
              {platform && <ConnectorPlatformIcon platform={platform} />}
            </div>
          ))}
      </div>
      <IconButton
        onClick={() => {
          onDelete(target);
        }}
      >
        <Minus />
      </IconButton>
    </div>
  );
}

export default SelectedConnectorItem;
