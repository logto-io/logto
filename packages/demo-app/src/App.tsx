import React from 'react';

import '@/scss/normalized.scss';
import * as styles from './App.module.scss';
import congrats from './assets/congrats.svg';

const App = () => {
  return (
    <div className={styles.app}>
      <div className={styles.card}>
        <img src={congrats} alt="Congrats" />

        <div className={styles.title}>You&apos;ve successfully signed in the demo app!</div>
        <div className={styles.text}>Here is your personal information:</div>
        <div className={styles.infoCard}>
          <p>
            Username: <b>Joycerobinson</b>
          </p>
          <p>
            User ID: <b>logtofireworks8892</b>
          </p>
        </div>
        <div className={styles.button}>Sign out the demo app</div>
        <div className={styles.continue}>
          <div className={styles.hr} />
          or continue to explore
          <div className={styles.hr} />
        </div>
        <div className={styles.actions}>
          <a href="#">Customize sign-in experience</a>
          <span />
          <a href="#">Enable passwordless</a>
          <span />
          <a href="#">Add a social connector</a>
        </div>
      </div>
    </div>
  );
};

export default App;
