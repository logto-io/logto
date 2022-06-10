import React from 'react';

import illustration from '@/assets/images/loading-illustration.svg';
import { Daisy as Spinner } from '@/components/Spinner';

import * as styles from './index.module.scss';

const AppLoading = () => (
  <div className={styles.container}>
    <img src={illustration} alt="loading" />
    <Spinner />
  </div>
);

export default AppLoading;
