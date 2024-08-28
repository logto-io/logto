import classNames from 'classnames';

import * as radioStyles from '../ConnectorRadioGroup/ConnectorRadio/index.module.scss';
import * as radioGroupStyles from '../ConnectorRadioGroup/index.module.scss';

import * as styles from './index.module.scss';

type Props = {
  readonly numberOfLoadingConnectors?: number;
};

function Skeleton({ numberOfLoadingConnectors = 8 }: Props) {
  return (
    <div className={radioGroupStyles.connectorGroup}>
      {Array.from({ length: numberOfLoadingConnectors }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={classNames(radioStyles.connector, styles.connector)}>
          <div className={styles.logo} />
          <div className={radioStyles.content}>
            <div className={styles.name} />
            <div>
              <div className={styles.description} />
              <div className={classNames(styles.description, styles.shortDescription)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
