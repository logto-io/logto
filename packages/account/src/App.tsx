import LogtoSignature from '@experience/shared/components/LogtoSignature';
import { LogtoProvider, ReservedScope, useLogto, UserScope } from '@logto/react';
import { accountCenterApplicationId, SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useMemo } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import AppBoundary from '@ac/Providers/AppBoundary';
import LoadingContextProvider from '@ac/Providers/LoadingContextProvider';
import MobileTabNav from '@ac/components/MobileTabNav';
import PageHeader from '@ac/components/PageHeader';
import Sidebar from '@ac/components/Sidebar';
import { buildAccountNavItems } from '@ac/components/account-nav-items';
import { layoutClassNames } from '@ac/constants/layout';

import styles from './App.module.scss';
import Callback from './Callback';
import { AccountLayoutProvider } from './Providers/AccountLayoutContext';
import ErrorBoundary from './Providers/AppBoundary/ErrorBoundary';
import LogtoErrorBoundary from './Providers/AppBoundary/LogtoErrorBoundary';
import PageContextProvider from './Providers/PageContextProvider';
import PageContext from './Providers/PageContextProvider/PageContext';
import GlobalLoading from './components/GlobalLoading';
import {
  securityRoute,
  profileRoute,
  emailRoute,
  emailSuccessRoute,
  phoneRoute,
  phoneSuccessRoute,
  passwordRoute,
  passwordSuccessRoute,
  usernameRoute,
  usernameSuccessRoute,
  authenticatorAppRoute,
  authenticatorAppReplaceRoute,
  authenticatorAppSuccessRoute,
  authenticatorAppReplaceSuccessRoute,
  backupCodesGenerateRoute,
  backupCodesRegenerateRoute,
  backupCodesSuccessRoute,
  backupCodesManageRoute,
  passkeyAddRoute,
  passkeyManageRoute,
  passkeySuccessRoute,
  socialSuccessRoute,
  socialCallbackRoutePrefix,
  socialRoutePrefix,
  verifiedActionRoute,
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
import Profile from './pages/Profile';
import Security from './pages/Security';
import SocialCallback from './pages/SocialCallback';
import SocialFlow from './pages/SocialFlow';
import TotpBinding from './pages/TotpBinding';
import UpdateSuccess from './pages/UpdateSuccess';
import Username from './pages/Username';
import VerifiedAction from './pages/VerifiedAction';
import { useAuthRedirect } from './use-auth-redirect';
import { accountCenterBasePath, handleAccountCenterRoute } from './utils/account-center-route';
import { hasVisibleSecuritySection } from './utils/security-page';
import '@experience/shared/scss/normalized.scss';

handleAccountCenterRoute();
void initI18n();

export const Main = () => {
  const params = new URLSearchParams(window.location.search);
  const { pathname } = window.location;
  const isSocialCallback = pathname.startsWith(
    `${accountCenterBasePath}${socialCallbackRoutePrefix}/`
  );
  const isAuthCallback =
    Boolean(params.get('code')) &&
    (pathname === accountCenterBasePath || pathname === `${accountCenterBasePath}/`);
  const isSilentAuthFailed =
    params.get('error') === 'login_required' &&
    (pathname === accountCenterBasePath || pathname === `${accountCenterBasePath}/`);
  const isInCallback = isSocialCallback || isAuthCallback;
  const { isAuthenticated, isLoading } = useLogto();
  const {
    accountCenterSettings,
    experienceSettings,
    isLoadingExperience,
    isLoadingUserInfo,
    userInfo,
  } = useContext(PageContext);
  const isInitialAuthLoading = !isAuthenticated && isLoading;

  useAuthRedirect({ isInCallback, isSilentAuthFailed });

  if (isSocialCallback) {
    return (
      <Routes>
        <Route path={`${socialCallbackRoutePrefix}/:connectorId`} element={<SocialCallback />} />
      </Routes>
    );
  }

  if (isAuthCallback) {
    return <Callback />;
  }

  if (isInitialAuthLoading || isLoadingExperience || isLoadingUserInfo) {
    return <GlobalLoading />;
  }

  // Account center is explicitly disabled - show error page for all routes
  if (accountCenterSettings?.enabled === false) {
    return (
      <Routes>
        <Route path="*" element={<Home />} />
      </Routes>
    );
  }

  if (!userInfo) {
    return <GlobalLoading />;
  }

  const showsSecurityPage = hasVisibleSecuritySection(accountCenterSettings, experienceSettings);

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
        path={authenticatorAppReplaceSuccessRoute}
        element={<UpdateSuccess identifierType="totp_replaced" />}
      />
      <Route
        path={backupCodesSuccessRoute}
        element={<UpdateSuccess identifierType="backup_code" />}
      />
      <Route path={passkeySuccessRoute} element={<UpdateSuccess identifierType="passkey" />} />
      <Route path={socialSuccessRoute} element={<UpdateSuccess identifierType="social" />} />
      <Route path={emailRoute} element={<Email />} />
      <Route path={phoneRoute} element={<Phone />} />
      <Route path={passwordRoute} element={<Password />} />
      <Route path={usernameRoute} element={<Username />} />
      <Route path={authenticatorAppReplaceRoute} element={<TotpBinding isReplace />} />
      <Route path={authenticatorAppRoute} element={<TotpBinding />} />
      <Route path={backupCodesGenerateRoute} element={<BackupCodeBinding />} />
      <Route path={backupCodesRegenerateRoute} element={<BackupCodeBinding isRegenerate />} />
      <Route path={backupCodesManageRoute} element={<BackupCodeView />} />
      <Route path={passkeyAddRoute} element={<PasskeyBinding />} />
      <Route path={passkeyManageRoute} element={<PasskeyView />} />
      <Route path={verifiedActionRoute} element={<VerifiedAction />} />
      <Route path={`${socialRoutePrefix}/:connectorId`} element={<SocialFlow mode="add" />} />
      <Route
        path={`${socialRoutePrefix}/:connectorId/change`}
        element={<SocialFlow mode="change" />}
      />
      <Route
        path={`${socialRoutePrefix}/:connectorId/remove`}
        element={<SocialFlow mode="remove" />}
      />
      {showsSecurityPage && <Route path={securityRoute} element={<Security />} />}
      <Route path={profileRoute} element={<Profile />} />
      <Route index element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

const Layout = () => {
  const { accountCenterSettings, experienceSettings, theme, platform } = useContext(PageContext);
  const hideLogtoBranding = experienceSettings?.hideLogtoBranding === true;
  const { pathname } = useLocation();
  const showsSecurityPage = hasVisibleSecuritySection(accountCenterSettings, experienceSettings);
  const hasProfilePage = true;
  const isSecurityFullPage = pathname === securityRoute && showsSecurityPage;
  const isProfileFullPage = pathname === profileRoute && hasProfilePage;
  const isFullPage = isSecurityFullPage || isProfileFullPage;
  const accountNavItems = useMemo(
    () => buildAccountNavItems({ hasProfile: hasProfilePage, hasSecurity: showsSecurityPage }),
    [hasProfilePage, showsSecurityPage]
  );
  const showsMultiPageNav = isFullPage && accountNavItems.length > 1;
  const showsMobileTabNav = platform === 'mobile' && showsMultiPageNav;
  const showsSidebar = platform !== 'mobile' && showsMultiPageNav;

  return (
    <div className={classNames(styles.app, layoutClassNames.app)}>
      <div
        className={classNames(
          styles.layout,
          isFullPage && styles.fullPage,
          showsMultiPageNav && layoutClassNames.withTabNav,
          layoutClassNames.pageContainer
        )}
      >
        {isFullPage && <PageHeader />}
        {showsMobileTabNav && <MobileTabNav items={accountNavItems} />}
        <div
          className={classNames(
            styles.container,
            !isFullPage && styles.cardContainer,
            !isFullPage && layoutClassNames.cardContainer,
            showsSidebar && styles.withSidebar,
            showsMobileTabNav && styles.withMobileTabNav
          )}
        >
          {showsSidebar && <Sidebar items={accountNavItems} />}
          <AccountLayoutProvider
            value={{
              showsMultiPageNav,
              showsMobileTabNav,
            }}
          >
            <main
              className={classNames(
                styles.main,
                !isFullPage && styles.cardMain,
                isFullPage ? layoutClassNames.mainContent : layoutClassNames.cardMain
              )}
            >
              <ErrorBoundary>
                <LogtoErrorBoundary>
                  <Main />
                </LogtoErrorBoundary>
              </ErrorBoundary>
              {!isFullPage && !hideLogtoBranding && (
                <LogtoSignature
                  className={classNames(styles.signature, layoutClassNames.signature)}
                  theme={theme}
                />
              )}
            </main>
          </AccountLayoutProvider>
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
          UserScope.Address,
          UserScope.Identities,
          UserScope.CustomData,
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
