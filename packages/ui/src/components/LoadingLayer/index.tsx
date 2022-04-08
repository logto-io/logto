import React from 'react';

import { LoadingIcon } from '../Icons';
import * as styles from './index.module.scss';

const LoadingLayer = () => (
  <div className={styles.overlay}>
    <div className={styles.container}>
      <LoadingIcon className={styles.loadingIcon} />
    </div>
  </div>
);

export default LoadingLayer;
