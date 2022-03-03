import React from 'react';

import * as styles from './index.module.scss';
import logo from './logo.svg';

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
