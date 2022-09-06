import { LogtoProvider, useLogto, IdTokenClaims, Prompt } from '@logto/react';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import '@/scss/normalized.scss';
import * as styles from './App.module.scss';
import Callback from './Callback';
import congratsDark from './assets/congrats-dark.svg';
import congrats from './assets/congrats.svg';
import initI18n from './i18n/init';

void initI18n();

const Main = () => {
  const { isAuthenticated, getIdTokenClaims, signIn, signOut } = useLogto();
  const [user, setUser] = useState<Pick<IdTokenClaims, 'sub' | 'username'>>();
  const { t } = useTranslation(undefined, { keyPrefix: 'demo_app' });
  const isInCallback = Boolean(new URL(window.location.href).searchParams.get('code'));
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [congratsIcon, setCongratsIcon] = useState<string>(isDarkMode ? congratsDark : congrats);

  useEffect(() => {
    if (isInCallback) {
      return;
    }

    if (isAuthenticated) {
      (async () => {
        const userInfo = await getIdTokenClaims();
        setUser(userInfo ?? { sub: 'N/A', username: 'N/A' });
      })();
    } else {
      void signIn(window.location.href);
    }
  }, [getIdTokenClaims, isAuthenticated, isInCallback, signIn, t]);

  useEffect(() => {
    const onThemeChange = (event: MediaQueryListEvent) => {
      const isDarkMode = event.matches;
      setCongratsIcon(isDarkMode ? congratsDark : congrats);
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onThemeChange);

    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', onThemeChange);
    };
  }, []);

  if (isInCallback) {
    return <Callback />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={styles.app}>
      <div className={styles.card}>
        {congratsIcon && <img src={congratsIcon} alt="Congrats" />}
        <div className={styles.title}>{t('title')}</div>
        <div className={styles.text}>{t('subtitle')}</div>
        <div className={styles.infoCard}>
          {user.username && (
            <div>
              {t('username')}
              <span>{user.username}</span>
            </div>
          )}
          <div>
            {t('user_id')}
            <span>{user.sub}</span>
          </div>
        </div>
        <div
          className={styles.button}
          onClick={async () => signOut(`${window.location.origin}/demo-app`)}
        >
          {t('sign_out')}
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
        prompt: Prompt.Login,
      }}
    >
      <Main />
    </LogtoProvider>
  );
};

export default App;
