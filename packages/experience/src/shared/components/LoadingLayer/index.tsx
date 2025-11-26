import LoadingIcon from './LoadingIcon';
import LoadingMask from './LoadingMask';
import styles from './index.module.scss';

export { default as LoadingIcon } from './LoadingIcon';
export { default as LoadingMask } from './LoadingMask';

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
