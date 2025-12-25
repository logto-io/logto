import LogtoSignature from '@experience/shared/components/LogtoSignature';
import { LogtoProvider, useLogto, UserScope } from '@logto/react';
import { accountCenterApplicationId, SignInIdentifier } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AppBoundary from '@ac/Providers/AppBoundary';
import LoadingContextProvider from '@ac/Providers/LoadingContextProvider';

import styles from './App.module.scss';
import Callback from './Callback';
import ErrorBoundary from './Providers/AppBoundary/ErrorBoundary';
import LogtoErrorBoundary from './Providers/AppBoundary/LogtoErrorBoundary';
import PageContextProvider from './Providers/PageContextProvider';
import PageContext from './Providers/PageContextProvider/PageContext';
import BrandingHeader from './components/BrandingHeader';
import {
  emailRoute,
  emailSuccessRoute,
  phoneRoute,
  phoneSuccessRoute,
  passwordRoute,
  passwordSuccessRoute,
  usernameRoute,
  usernameSuccessRoute,
  authenticatorAppRoute,
  authenticatorAppSuccessRoute,
  backupCodesGenerateRoute,
  backupCodesSuccessRoute,
  backupCodesDeletedRoute,
  backupCodesManageRoute,
  passkeyAddRoute,
  passkeyManageRoute,
  passkeySuccessRoute,
  passkeyDeletedRoute,
} from './constants/routes';
import initI18n from './i18n/init';
import BackupCodeBinding from './pages/BackupCodeBinding';
import BackupCodeView from './pages/BackupCodeView';
import Email from './pages/Email';
import Home from './pages/Home';
import PasskeyBinding from './pages/PasskeyBinding';
import PasskeyView from './pages/PasskeyView';
import Password from './pages/Password';
import Phone from './pages/Phone';
import TotpBinding from './pages/TotpBinding';
import UpdateSuccess from './pages/UpdateSuccess';
import Username from './pages/Username';
import { accountCenterBasePath, handleAccountCenterRoute } from './utils/account-center-route';
import '@experience/shared/scss/normalized.scss';

void initI18n();
handleAccountCenterRoute();

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

const Main = () => {
  const params = new URLSearchParams(window.location.search);
  const isInCallback = Boolean(params.get('code'));
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const { isLoadingExperience } = useContext(PageContext);
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

  if (isInitialAuthLoading || isLoadingExperience) {
    return <div className={styles.status}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <div className={styles.status}>Redirecting to sign in…</div>;
  }

  return (
    <Routes>
      <Route
        path={emailSuccessRoute}
        element={<UpdateSuccess identifierType={SignInIdentifier.Email} />}
      />
      <Route
        path={phoneSuccessRoute}
        element={<UpdateSuccess identifierType={SignInIdentifier.Phone} />}
      />
      <Route
        path={usernameSuccessRoute}
        element={<UpdateSuccess identifierType={SignInIdentifier.Username} />}
      />
      <Route path={passwordSuccessRoute} element={<UpdateSuccess identifierType="password" />} />
      <Route
        path={authenticatorAppSuccessRoute}
        element={<UpdateSuccess identifierType="totp" />}
      />
      <Route
        path={backupCodesSuccessRoute}
        element={<UpdateSuccess identifierType="backup_code" />}
      />
      <Route
        path={backupCodesDeletedRoute}
        element={<UpdateSuccess identifierType="backup_code_deleted" />}
      />
      <Route path={passkeySuccessRoute} element={<UpdateSuccess identifierType="passkey" />} />
      <Route
        path={passkeyDeletedRoute}
        element={<UpdateSuccess identifierType="passkey_deleted" />}
      />
      <Route path={emailRoute} element={<Email />} />
      <Route path={phoneRoute} element={<Phone />} />
      <Route path={passwordRoute} element={<Password />} />
      <Route path={usernameRoute} element={<Username />} />
      <Route path={authenticatorAppRoute} element={<TotpBinding />} />
      <Route path={backupCodesGenerateRoute} element={<BackupCodeBinding />} />
      <Route path={backupCodesManageRoute} element={<BackupCodeView />} />
      <Route path={passkeyAddRoute} element={<PasskeyBinding />} />
      <Route path={passkeyManageRoute} element={<PasskeyView />} />
      <Route index element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

const Layout = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const hideLogtoBranding = experienceSettings?.hideLogtoBranding === true;

  return (
    <div className={styles.app}>
      <BrandingHeader />
      <div className={styles.layout}>
        <div className={styles.container}>
          <main className={styles.main}>
            <ErrorBoundary>
              <LogtoErrorBoundary>
                <Main />
              </LogtoErrorBoundary>
            </ErrorBoundary>
            {!hideLogtoBranding && <LogtoSignature className={styles.signature} theme={theme} />}
          </main>
        </div>
      </div>
    </div>
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
            <Layout />
          </AppBoundary>
        </PageContextProvider>
      </LoadingContextProvider>
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
