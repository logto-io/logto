import classNames from 'classnames';

import * as styles from './Skeleton.module.scss';
import * as layout from './index.module.scss';

function Skeleton() {
  return (
    <div className={layout.connectorGroup}>
      {Array.from({ length: 8 }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={classNames(layout.connector, styles.connector)}>
          <div className={styles.logo} />
          <div className={layout.content}>
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
