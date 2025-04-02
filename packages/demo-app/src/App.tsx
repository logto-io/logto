import { type IdTokenClaims, LogtoProvider, useLogto, type Prompt } from '@logto/react';
import { demoAppApplicationId } from '@logto/schemas';
import i18next from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import '@/scss/normalized.scss';

import styles from './App.module.scss';
import Callback from './Callback';
import DevPanel from './DevPanel';
import congratsDark from './assets/congrats-dark.svg';
import congrats from './assets/congrats.svg';
import initI18n from './i18n/init';
import { getLocalData, setLocalData } from './utils';

void initI18n();

const Main = () => {
  const config = getLocalData('config');
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
  const redirectUri = window.location.origin + window.location.pathname;

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

    const oneTimeToken = params.get('one_time_token');
    const loginHint = params.get('login_hint');

    const hasMagicLinkParams = Boolean(oneTimeToken && loginHint);

    const loadIdTokenClaims = async () => {
      const userInfo = await getIdTokenClaims();
      setUser(userInfo ?? { sub: 'N/A', username: 'N/A' });
    };

    // If user is authenticated but user info is not loaded yet, load it
    if (isAuthenticated && !user) {
      void loadIdTokenClaims();
    }

    const extraParams = Object.fromEntries(
      new URLSearchParams([
        ...new URLSearchParams(config.signInExtraParams).entries(),
        ...new URLSearchParams(window.location.search).entries(),
      ]).entries()
    );

    // If user is not authenticated, redirect to sign-in page
    if (!isAuthenticated) {
      void signIn({ redirectUri, extraParams });
    }

    if (isAuthenticated && hasMagicLinkParams) {
      void signIn({
        clearTokens: false,
        redirectUri,
        extraParams,
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [
    params,
    config.signInExtraParams,
    error,
    getIdTokenClaims,
    isAuthenticated,
    isInCallback,
    isLoading,
    signIn,
    user,
    redirectUri,
  ]);

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
      <Helmet
        htmlAttributes={{
          // We intentionally use the imported i18next instance instead of the hook, since the hook
          // will cause a re-render following some bugs here. This still works for the initial
          // render, so we're good for now. Consider refactoring this in the future.
          lang: i18next.language,
          dir: i18next.dir(),
        }}
      />
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
  const params = new URL(window.location.href).searchParams;
  const config = getLocalData('config');

  return (
    <LogtoProvider
      config={{
        endpoint: window.location.origin,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- We need to fall back for empty string
        appId: params.get('app_id') || config.appId || demoAppApplicationId,
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
