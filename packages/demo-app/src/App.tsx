import React from 'react';

import '@/scss/normalized.scss';
import * as styles from './App.module.scss';

const App = () => {
  return (
    <div className={styles.app}>
      <div className={styles.card}>Congrats</div>
    </div>
  );
};

export default App;
