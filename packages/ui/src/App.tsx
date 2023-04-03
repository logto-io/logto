import { appInsightsReact } from '@logto/app-insights/lib/react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import AppLayout from './Layout/AppLayout';
import AppBoundary from './Providers/AppBoundary';
import LoadingLayerProvider from './Providers/LoadingLayerProvider';
import PageContextProvider from './Providers/PageContextProvider';
import SettingsProvider from './Providers/SettingsProvider';
import Callback from './pages/Callback';
import Consent from './pages/Consent';
import Continue from './pages/Continue';
import ErrorPage from './pages/ErrorPage';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import RegisterPassword from './pages/RegisterPassword';
import ResetPassword from './pages/ResetPassword';
import SignIn from './pages/SignIn';
import SignInPassword from './pages/SignInPassword';
import SocialLanding from './pages/SocialLanding';
import SocialLinkAccount from './pages/SocialLinkAccount';
import SocialSignIn from './pages/SocialSignInCallback';
import Springboard from './pages/Springboard';
import VerificationCode from './pages/VerificationCode';
import { shouldTrack } from './utils/cookies';
import { handleSearchParametersData } from './utils/search-parameters';

import './scss/normalized.scss';

if (shouldTrack) {
  // Use `.then()` for better compatibility, update to top-level await some day
  // eslint-disable-next-line unicorn/prefer-top-level-await, promise/prefer-await-to-then
  void appInsightsReact.setup().then((success) => {
    if (success) {
      console.debug('Initialized ApplicationInsights');
    }
  });
}

handleSearchParametersData();

const App = () => {
  return (
    <BrowserRouter>
      <PageContextProvider>
        <SettingsProvider>
          <AppBoundary>
            <Routes>
              <Route path="sign-in/consent" element={<Consent />} />
              <Route element={<AppLayout />}>
                <Route
                  path="unknown-session"
                  element={<ErrorPage message="error.invalid_session" />}
                />
                <Route path="springboard" element={<Springboard />} />

                <Route element={<LoadingLayerProvider />}>
                  {/* Sign-in */}
                  <Route path="sign-in">
                    <Route index element={<SignIn />} />
                    <Route path="password" element={<SignInPassword />} />
                    <Route path="social/:connectorId" element={<SocialSignIn />} />
                  </Route>

                  {/* Register */}
                  <Route path="register">
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

                  {/* Continue set up missing profile */}
                  <Route path="continue">
                    <Route path=":method" element={<Continue />} />
                  </Route>

                  {/* Social sign-in pages */}
                  <Route path="social">
                    <Route path="link/:connectorId" element={<SocialLinkAccount />} />
                    <Route path="landing/:connectorId" element={<SocialLanding />} />
                  </Route>
                  <Route path="callback/:connectorId" element={<Callback />} />
                </Route>

                <Route path="*" element={<ErrorPage />} />
              </Route>
            </Routes>
          </AppBoundary>
        </SettingsProvider>
      </PageContextProvider>
    </BrowserRouter>
  );
};

export default App;
