import LoadingMask from '../LoadingMask';

import LoadingIcon from './LoadingIcon';
import styles from './index.module.scss';

export { default as LoadingIcon } from './LoadingIcon';

const LoadingLayer = () => (
  <LoadingMask>
    <div className={styles.container}>
      <LoadingIcon />
    </div>
  </LoadingMask>
);

export default LoadingLayer;
