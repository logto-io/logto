import { type IdTokenClaims, LogtoProvider, useLogto, type Prompt } from '@logto/react';
import { demoAppApplicationId } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import '@/scss/normalized.scss';

import * as styles from './App.module.scss';
import Callback from './Callback';
import DevPanel from './DevPanel';
import congratsDark from './assets/congrats-dark.svg';
import congrats from './assets/congrats.svg';
import initI18n from './i18n/init';
import { getLocalData, setLocalData } from './utils';

void initI18n();

const Main = () => {
  const params = new URL(window.location.href).searchParams;
  const { isAuthenticated, isLoading, getIdTokenClaims, signIn, signOut } = useLogto();
  const [user, setUser] = useState<Pick<IdTokenClaims, 'sub' | 'username'>>();
  const { t } = useTranslation(undefined, { keyPrefix: 'demo_app' });
  const isInCallback = Boolean(params.get('code'));
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [congratsIcon, setCongratsIcon] = useState<string>(isDarkMode ? congratsDark : congrats);
  const [showDevPanel, setShowDevPanel] = useState(getLocalData('ui').showDevPanel ?? false);
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  const toggleDevPanel = useCallback(() => {
    setShowDevPanel((previous) => {
      setLocalData('ui', { showDevPanel: !previous });
      return !previous;
    });
  }, []);

  useEffect(() => {
    if (isInCallback || isLoading || error) {
      return;
    }

    const loadIdTokenClaims = async () => {
      const userInfo = await getIdTokenClaims();
      setUser(userInfo ?? { sub: 'N/A', username: 'N/A' });
    };

    // If user is authenticated but user info is not loaded yet, load it
    if (isAuthenticated && !user) {
      void loadIdTokenClaims();
    }

    // If user is not authenticated, redirect to sign-in page
    if (!isAuthenticated) {
      void signIn({
        redirectUri: window.location.origin + window.location.pathname,
        extraParams: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
      });
    }
  }, [error, getIdTokenClaims, isAuthenticated, isInCallback, isLoading, signIn, user]);

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

  if (error) {
    return (
      <div className={styles.app}>
        <div className={styles.error}>
          <p>
            Error occurred: {error}
            <br />
            {errorDescription}
          </p>
          <button
            className={styles.button}
            onClick={() => {
              setLocalData('config', {});
              window.location.assign('/demo-app');
            }}
          >
            Reset config and retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={styles.app}>
      {showDevPanel && <DevPanel />}
      <div className={[styles.card, styles.congrats].join(' ')}>
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
          role="button"
          tabIndex={0}
          className={styles.button}
          onClick={async () => signOut(`${window.location.origin}/demo-app`)}
          onKeyDown={({ key }) => {
            if (key === 'Enter' || key === ' ') {
              void signOut(`${window.location.origin}/demo-app`);
            }
          }}
        >
          {t('sign_out')}
        </div>
        <div
          role="button"
          tabIndex={0}
          className={styles.button}
          onClick={toggleDevPanel}
          onKeyDown={({ key }) => {
            if (key === 'Enter' || key === ' ') {
              toggleDevPanel();
            }
          }}
        >
          {showDevPanel ? 'Close' : 'Open'} dev panel
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const config = getLocalData('config');

  return (
    <LogtoProvider
      config={{
        endpoint: window.location.origin,
        appId: demoAppApplicationId,
        // eslint-disable-next-line no-restricted-syntax
        prompt: config.prompt ? (config.prompt.split(' ') as Prompt[]) : [],
        scopes: config.scope ? config.scope.split(' ') : [],
        resources: config.resource ? config.resource.split(' ') : [],
      }}
    >
      <Main />
    </LogtoProvider>
  );
};

export default App;
