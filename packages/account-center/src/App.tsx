import { LogtoProvider, useLogto, UserScope } from '@logto/react';
import { accountCenterApplicationId } from '@logto/schemas';
import { useContext, useEffect } from 'react';

import AppBoundary from '@ac/Providers/AppBoundary';

import styles from './App.module.scss';
import Callback from './Callback';
import PageContextProvider from './Providers/PageContextProvider';
import PageContext from './Providers/PageContextProvider/PageContext';
import BrandingHeader from './components/BrandingHeader';
import ErrorPage from './components/ErrorPage';
import initI18n from './i18n/init';
import Email from './pages/Email';
import Home from './pages/Home';
import { accountCenterBasePath, handleAccountCenterRoute } from './utils/account-center-route';

import '@experience/shared/scss/normalized.scss';

void initI18n();
handleAccountCenterRoute();

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

const Main = () => {
  const params = new URLSearchParams(window.location.search);
  const isInCallback = Boolean(params.get('code'));
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const { isLoadingExperience, experienceError, userInfoError } = useContext(PageContext);

  useEffect(() => {
    if (isInCallback || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      void signIn({ redirectUri });
    }
  }, [isAuthenticated, isInCallback, isLoading, signIn]);

  if (isInCallback) {
    return <Callback />;
  }

  if (experienceError ?? userInfoError) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        rawMessage="We were unable to load your experience settings. Please refresh the page."
      />
    );
  }

  if (isLoading || isLoadingExperience) {
    return <div className={styles.status}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <div className={styles.status}>Redirecting to sign in…</div>;
  }

  if (window.location.pathname === `${accountCenterBasePath}/email`) {
    return <Email />;
  }

  return <Home />;
};

const App = () => (
  <LogtoProvider
    config={{
      endpoint: window.location.origin,
      appId: accountCenterApplicationId,
      scopes: [UserScope.Profile, UserScope.Email, UserScope.Phone, UserScope.Identities],
    }}
  >
    <PageContextProvider>
      <AppBoundary>
        <div className={styles.app}>
          <BrandingHeader />
          <div className={styles.layout}>
            <div className={styles.container}>
              <main className={styles.main}>
                <Main />
              </main>
            </div>
          </div>
        </div>
      </AppBoundary>
    </PageContextProvider>
  </LogtoProvider>
);

export default App;
