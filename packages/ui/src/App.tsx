import { SignInMode } from '@logto/schemas';
import { useEffect, useRef } from 'react';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';

import AppBoundary from './containers/AppBoundary';
import AppContent from './containers/AppContent';
import LoadingLayerProvider from './containers/LoadingLayerProvider';
import usePageContext from './hooks/use-page-context';
import usePreview from './hooks/use-preview';
import initI18n from './i18n/init';
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
import VerificationCode from './pages/VerificationCode';
import { getSignInExperienceSettings } from './utils/sign-in-experience';

import './scss/normalized.scss';

const App = () => {
  const { context, Provider } = usePageContext();
  const { experienceSettings, setLoading, setExperienceSettings } = context;
  const customCssRef = useRef(document.createElement('style'));
  const [isPreview] = usePreview(context);

  useEffect(() => {
    document.head.append(customCssRef.current);
  }, []);

  useEffect(() => {
    if (isPreview) {
      return;
    }

    (async () => {
      const settings = await getSignInExperienceSettings();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      customCssRef.current.textContent = settings.customCss;

      // Note: i18n must be initialized ahead of page render
      await initI18n(settings.languageInfo);

      // Init the page settings and render
      setExperienceSettings(settings);
    })();
  }, [isPreview, setExperienceSettings, setLoading]);

  if (!experienceSettings) {
    return null;
  }

  const isRegisterOnly = experienceSettings.signInMode === SignInMode.Register;
  const isSignInOnly = experienceSettings.signInMode === SignInMode.SignIn;

  return (
    <BrowserRouter>
      <Provider value={context}>
        <AppBoundary>
          <Routes>
            <Route element={<AppContent />}>
              <Route
                path="unknown-session"
                element={<ErrorPage message="error.invalid_session" />}
              />

              <Route path="sign-in/consent" element={<Consent />} />

              <Route element={<LoadingLayerProvider />}>
                {/* Sign-in */}
                <Route path="sign-in">
                  <Route
                    index
                    element={isRegisterOnly ? <Navigate replace to="/register" /> : <SignIn />}
                  />
                  <Route path="password" element={<SignInPassword />} />
                  <Route path="social/:connectorId" element={<SocialSignIn />} />
                </Route>

                {/* Register */}
                <Route path="register">
                  <Route
                    index
                    element={isSignInOnly ? <Navigate replace to="/sign-in" /> : <Register />}
                  />
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
      </Provider>
    </BrowserRouter>
  );
};

export default App;
