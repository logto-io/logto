import Draggable from '@/assets/images/draggable.svg';
import Minus from '@/assets/images/minus.svg';
import ConnectorLogo from '@/components/ConnectorLogo';
import IconButton from '@/components/IconButton';
import UnnamedTrans from '@/components/UnnamedTrans';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';
import type { ConnectorGroup } from '@/types/connector';

import * as styles from './SelectedConnectorItem.module.scss';

type Props = {
  data: ConnectorGroup;
  onDelete: (connectorTarget: string) => void;
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
