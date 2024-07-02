import { MfaFactor, experience } from '@logto/schemas';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import AppLayout from './Layout/AppLayout';
import AppBoundary from './Providers/AppBoundary';
import LoadingLayerProvider from './Providers/LoadingLayerProvider';
import PageContextProvider from './Providers/PageContextProvider';
import SettingsProvider from './Providers/SettingsProvider';
import UserInteractionContextProvider from './Providers/UserInteractionContextProvider';
import Callback from './pages/Callback';
import Consent from './pages/Consent';
import Continue from './pages/Continue';
import DirectSignIn from './pages/DirectSignIn';
import ErrorPage from './pages/ErrorPage';
import ForgotPassword from './pages/ForgotPassword';
import MfaBinding from './pages/MfaBinding';
import BackupCodeBinding from './pages/MfaBinding/BackupCodeBinding';
import TotpBinding from './pages/MfaBinding/TotpBinding';
import WebAuthnBinding from './pages/MfaBinding/WebAuthnBinding';
import MfaVerification from './pages/MfaVerification';
import BackupCodeVerification from './pages/MfaVerification/BackupCodeVerification';
import TotpVerification from './pages/MfaVerification/TotpVerification';
import WebAuthnVerification from './pages/MfaVerification/WebAuthnVerification';
import Register from './pages/Register';
import RegisterPassword from './pages/RegisterPassword';
import ResetPassword from './pages/ResetPassword';
import SignIn from './pages/SignIn';
import SignInPassword from './pages/SignInPassword';
import SingleSignOnConnectors from './pages/SingleSignOnConnectors';
import SingleSignOnEmail from './pages/SingleSignOnEmail';
import SocialLanding from './pages/SocialLanding';
import SocialLinkAccount from './pages/SocialLinkAccount';
import SocialSignInWebCallback from './pages/SocialSignInWebCallback';
import Springboard from './pages/Springboard';
import VerificationCode from './pages/VerificationCode';
import { UserMfaFlow } from './types';
import { handleSearchParametersData } from './utils/search-parameters';

import './scss/normalized.scss';

handleSearchParametersData();

const App = () => {
  return (
    <BrowserRouter>
      <PageContextProvider>
        <SettingsProvider>
          <UserInteractionContextProvider>
            <AppBoundary>
              <Routes>
                <Route element={<LoadingLayerProvider />}>
                  <Route path="springboard" element={<Springboard />} />
                  <Route path="callback/:connectorId" element={<Callback />} />
                  <Route
                    path="callback/social/:connectorId"
                    element={<SocialSignInWebCallback />}
                  />
                  <Route path="direct/:method/:target?" element={<DirectSignIn />} />

                  <Route element={<AppLayout />}>
                    <Route
                      path="unknown-session"
                      element={<ErrorPage message="error.invalid_session" />}
                    />

                    {/* Sign-in */}
                    <Route path={experience.routes.signIn}>
                      <Route index element={<SignIn />} />
                      <Route path="password" element={<SignInPassword />} />
                    </Route>

                    {/* Register */}
                    <Route path={experience.routes.register}>
                      <Route index element={<Register />} />
                      <Route path="password" element={<RegisterPassword />} />
                    </Route>

                    {/* Forgot password */}
                    <Route path="forgot-password">
                      <Route index element={<ForgotPassword />} />
                      <Route path="reset" element={<ResetPassword />} />
                    </Route>

                    {/* Passwordless verification code */}
                    <Route path=":flow/verification-code" element={<VerificationCode />} />

                    {/* Mfa binding */}
                    <Route path={UserMfaFlow.MfaBinding}>
                      <Route index element={<MfaBinding />} />
                      <Route path={MfaFactor.TOTP} element={<TotpBinding />} />
                      <Route path={MfaFactor.WebAuthn} element={<WebAuthnBinding />} />
                      <Route path={MfaFactor.BackupCode} element={<BackupCodeBinding />} />
                    </Route>

                    {/* Mfa verification */}
                    <Route path={UserMfaFlow.MfaVerification}>
                      <Route index element={<MfaVerification />} />
                      <Route path={MfaFactor.TOTP} element={<TotpVerification />} />
                      <Route path={MfaFactor.WebAuthn} element={<WebAuthnVerification />} />
                      <Route path={MfaFactor.BackupCode} element={<BackupCodeVerification />} />
                    </Route>

                    {/* Continue set up missing profile */}
                    <Route path="continue">
                      <Route path=":method" element={<Continue />} />
                    </Route>

                    {/* Social sign-in pages */}
                    <Route path="social">
                      <Route path="link/:connectorId" element={<SocialLinkAccount />} />
                      <Route path="landing/:connectorId" element={<SocialLanding />} />
                    </Route>

                    {/* Single sign-on */}
                    <Route path={experience.routes.sso} element={<LoadingLayerProvider />}>
                      <Route path="email" element={<SingleSignOnEmail />} />
                      <Route path="connectors" element={<SingleSignOnConnectors />} />
                    </Route>

                    {/* Consent */}
                    <Route path="consent" element={<Consent />} />

                    <Route path="*" element={<ErrorPage />} />
                  </Route>
                </Route>
              </Routes>
            </AppBoundary>
          </UserInteractionContextProvider>
        </SettingsProvider>
      </PageContextProvider>
    </BrowserRouter>
  );
};

export default App;
