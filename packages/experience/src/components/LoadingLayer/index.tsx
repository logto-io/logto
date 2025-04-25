import LoadingMask from '../LoadingMask';

import LoadingIcon from './LoadingIcon';
import styles from './index.module.scss';

export { default as LoadingIcon } from './LoadingIcon';

export const LoadingIconWithContainer = () => (
  <div className={styles.container}>
    <LoadingIcon />
  </div>
);

const LoadingLayer = () => (
  <LoadingMask>
    <LoadingIconWithContainer />
  </LoadingMask>
);

export default LoadingLayer;
