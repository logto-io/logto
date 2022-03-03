import React from 'react';

import logo from '@/assets/images/logo.svg';

import * as styles from './index.module.scss';

const Topbar = () => {
  return (
    <div className={styles.topbar}>
      <img src={logo} />
      <div className={styles.line} />
      <div className={styles.text}>Admin Console</div>
    </div>
  );
};

export default Topbar;
