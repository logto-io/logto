import LogtoSignature from '@experience/shared/components/LogtoSignature';
import { LogtoProvider, Prompt, ReservedScope, useLogto, UserScope } from '@logto/react';
import { accountCenterApplicationId, ExtraParamsKey, SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import AppBoundary from '@ac/Providers/AppBoundary';
import LoadingContextProvider from '@ac/Providers/LoadingContextProvider';
import PageHeader from '@ac/components/PageHeader';

import styles from './App.module.scss';
import Callback from './Callback';
import ErrorBoundary from './Providers/AppBoundary/ErrorBoundary';
import LogtoErrorBoundary from './Providers/AppBoundary/LogtoErrorBoundary';
import PageContextProvider from './Providers/PageContextProvider';
import PageContext from './Providers/PageContextProvider/PageContext';
import GlobalLoading from './components/GlobalLoading';
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
  backupCodesRegenerateRoute,
  backupCodesSuccessRoute,
  backupCodesManageRoute,
  passkeyAddRoute,
  passkeyManageRoute,
  passkeySuccessRoute,
} from './constants/routes';
import initI18n from './i18n/init';
import { resolveUiLocalesLanguage } from './i18n/utils';
import BackupCodeBinding from './pages/BackupCodeBinding';
import BackupCodeView from './pages/BackupCodeView';
import Email from './pages/Email';
import Home from './pages/Home';
import PasskeyBinding from './pages/PasskeyBinding';
import PasskeyView from './pages/PasskeyView';
import Password from './pages/Password';
import Phone from './pages/Phone';
import Security from './pages/Security';
import TotpBinding from './pages/TotpBinding';
import UpdateSuccess from './pages/UpdateSuccess';
import Username from './pages/Username';
import {
  accountCenterBasePath,
  getUiLocales,
  handleAccountCenterRoute,
} from './utils/account-center-route';
import { getIsDevFeaturesEnabled } from './utils/dev-features';
import { shouldShowSecurityPage } from './utils/security-page';
import '@experience/shared/scss/normalized.scss';

handleAccountCenterRoute();
void initI18n(resolveUiLocalesLanguage(getUiLocales()));

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;
const normalizeEnv = (value: unknown) =>
  value === null || value === undefined ? undefined : String(value);
const isDevFeaturesEnabled = getIsDevFeaturesEnabled(
  import.meta.env.PROD,
  normalizeEnv(Reflect.get(import.meta.env, 'DEV_FEATURES_ENABLED'))
);

const Main = () => {
  const params = new URLSearchParams(window.location.search);
  const isInCallback = Boolean(params.get('code'));
  const uiLocales = getUiLocales();
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const { accountCenterSettings, isLoadingExperience, isLoadingUserInfo, userInfo, userInfoError } =
    useContext(PageContext);
  const isInitialAuthLoading = !isAuthenticated && isLoading;

  useEffect(() => {
    if (isInCallback || isInitialAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      const extraParams = uiLocales ? { [ExtraParamsKey.UiLocales]: uiLocales } : undefined;
      void signIn({ redirectUri, extraParams });
    }
  }, [isAuthenticated, isInCallback, isInitialAuthLoading, signIn, uiLocales]);

  useEffect(() => {
    if (isInCallback || isInitialAuthLoading || !isAuthenticated || isLoadingUserInfo) {
      return;
    }

    if (userInfoError) {
      const extraParams = uiLocales ? { [ExtraParamsKey.UiLocales]: uiLocales } : undefined;
      void signIn({ redirectUri, prompt: Prompt.Login, extraParams });
    }
  }, [
    isAuthenticated,
    isInCallback,
    isInitialAuthLoading,
    isLoadingUserInfo,
    signIn,
    uiLocales,
    userInfoError,
  ]);
  if (isInCallback) {
    return <Callback />;
  }

  if (isInitialAuthLoading || isLoadingExperience || isLoadingUserInfo) {
    return <GlobalLoading />;
  }

  if (!userInfo) {
    return <GlobalLoading />;
  }

  const showsSecurityPage = shouldShowSecurityPage(isDevFeaturesEnabled, accountCenterSettings);
  const indexElement = showsSecurityPage ? <Security /> : <Home />;

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
      <Route path={passkeySuccessRoute} element={<UpdateSuccess identifierType="passkey" />} />
      <Route path={emailRoute} element={<Email />} />
      <Route path={phoneRoute} element={<Phone />} />
      <Route path={passwordRoute} element={<Password />} />
      <Route path={usernameRoute} element={<Username />} />
      <Route path={authenticatorAppRoute} element={<TotpBinding />} />
      <Route path={backupCodesGenerateRoute} element={<BackupCodeBinding />} />
      <Route path={backupCodesRegenerateRoute} element={<BackupCodeBinding isRegenerate />} />
      <Route path={backupCodesManageRoute} element={<BackupCodeView />} />
      <Route path={passkeyAddRoute} element={<PasskeyBinding />} />
      <Route path={passkeyManageRoute} element={<PasskeyView />} />
      <Route index element={indexElement} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

const Layout = () => {
  const { accountCenterSettings, experienceSettings, theme } = useContext(PageContext);
  const hideLogtoBranding = experienceSettings?.hideLogtoBranding === true;
  const { pathname } = useLocation();
  const isHomePage =
    pathname === '/' && shouldShowSecurityPage(isDevFeaturesEnabled, accountCenterSettings);

  return (
    <div className={styles.app}>
      <div className={classNames(styles.layout, isHomePage && styles.fullPage)}>
        {isHomePage && <PageHeader />}
        <div className={classNames(styles.container, !isHomePage && styles.cardContainer)}>
          <main className={classNames(styles.main, !isHomePage && styles.cardMain)}>
            <ErrorBoundary>
              <LogtoErrorBoundary>
                <Main />
              </LogtoErrorBoundary>
            </ErrorBoundary>
            {!isHomePage && !hideLogtoBranding && (
              <LogtoSignature className={styles.signature} theme={theme} />
            )}
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
        includeReservedScopes: false,
        scopes: [
          ReservedScope.OpenId,
          UserScope.Profile,
          UserScope.Email,
          UserScope.Phone,
          UserScope.Identities,
        ],
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
