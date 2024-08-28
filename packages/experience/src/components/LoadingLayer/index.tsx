import LoadingIcon from './LoadingIcon';
import * as styles from './index.module.scss';

export { default as LoadingIcon } from './LoadingIcon';

const LoadingLayer = () => (
  <div className={styles.overlay}>
    <div className={styles.container}>
      <LoadingIcon />
    </div>
  </div>
);

export default LoadingLayer;
