import { LogtoProvider, useLogto, UserScope } from '@logto/react';
import { accountCenterApplicationId } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AppBoundary from '@ac/Providers/AppBoundary';
import LoadingContextProvider from '@ac/Providers/LoadingContextProvider';

import styles from './App.module.scss';
import Callback from './Callback';
import PageContextProvider from './Providers/PageContextProvider';
import PageContext from './Providers/PageContextProvider/PageContext';
import BrandingHeader from './components/BrandingHeader';
import ErrorPage from './components/ErrorPage';
import { emailRoute, sessionExpiredRoute, updateSuccessRoute } from './constants/routes';
import initI18n from './i18n/init';
import Email from './pages/Email';
import Home from './pages/Home';
import SessionExpired from './pages/SessionExpired';
import UpdateSuccess from './pages/UpdateSuccess';
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
  const isInitialAuthLoading = !isAuthenticated && isLoading;

  useEffect(() => {
    if (isInCallback || isInitialAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      void signIn({ redirectUri });
    }
  }, [isAuthenticated, isInCallback, isInitialAuthLoading, signIn]);

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

  if (isInitialAuthLoading || isLoadingExperience) {
    return <div className={styles.status}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <div className={styles.status}>Redirecting to sign in…</div>;
  }

  return (
    <Routes>
      <Route path={sessionExpiredRoute} element={<SessionExpired />} />
      <Route path={updateSuccessRoute} element={<UpdateSuccess />} />
      <Route path={emailRoute} element={<Email />} />
      <Route index element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter basename={accountCenterBasePath}>
    <LogtoProvider
      config={{
        endpoint: window.location.origin,
        appId: accountCenterApplicationId,
        scopes: [UserScope.Profile, UserScope.Email, UserScope.Phone, UserScope.Identities],
      }}
    >
      <LoadingContextProvider>
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
      </LoadingContextProvider>
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
