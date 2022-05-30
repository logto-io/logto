import { LogtoProvider, useLogto } from '@logto/react';
import { demoAppApplicationId } from '@logto/schemas';
import React, { useEffect } from 'react';

import '@/scss/normalized.scss';
import * as styles from './App.module.scss';
import Callback from './Callback';
import congrats from './assets/congrats.svg';

const Main = () => {
  const { isAuthenticated, signIn } = useLogto();
  const isInCallback = Boolean(new URL(window.location.href).searchParams.get('code'));

  // Pending SDK fix
  const username = 'foo';
  const userId = 'bar';

  useEffect(() => {
    if (!isAuthenticated && !isInCallback) {
      void signIn(window.location.href);
    }
  }, [isAuthenticated, isInCallback, signIn]);

  if (isInCallback) {
    return <Callback />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.app}>
      <div className={styles.card}>
        <img src={congrats} alt="Congrats" />
        <div className={styles.title}>You&apos;ve successfully signed in the demo app!</div>
        <div className={styles.text}>Here is your personal information:</div>
        <div className={styles.infoCard}>
          <p>
            Username: <b>{username}</b>
          </p>
          <p>
            User ID: <b>{userId}</b>
          </p>
        </div>
        {/* Pending SDK fix */}
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

const App = () => {
  return (
    <LogtoProvider
      config={{
        endpoint: window.location.origin,
        appId: demoAppApplicationId,
      }}
    >
      <Main />
    </LogtoProvider>
  );
};

export default App;
