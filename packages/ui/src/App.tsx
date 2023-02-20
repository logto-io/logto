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
import ContinueWithEmailOrPhone from './pages/Continue/EmailOrPhone';
import ErrorPage from './pages/ErrorPage';
import ForgotPassword from './pages/ForgotPassword';
import PasswordRegisterWithUsername from './pages/PasswordRegisterWithUsername';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import SecondaryRegister from './pages/SecondaryRegister';
import SecondarySignIn from './pages/SecondarySignIn';
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
              <Route path="/" element={<Navigate replace to="/sign-in" />} />
              <Route path="/sign-in/consent" element={<Consent />} />
              <Route
                path="/unknown-session"
                element={<ErrorPage message="error.invalid_session" />}
              />

              <Route element={<LoadingLayerProvider />}>
                {/* Sign-in */}
                <Route
                  path="/sign-in"
                  element={isRegisterOnly ? <Navigate replace to="/register" /> : <SignIn />}
                />
                <Route path="/sign-in/social/:connectorId" element={<SocialSignIn />} />
                <Route path="/sign-in/:method" element={<SecondarySignIn />} />
                <Route path="/sign-in/:method/password" element={<SignInPassword />} />

                {/* Register */}
                <Route
                  path="/register"
                  element={isSignInOnly ? <Navigate replace to="/sign-in" /> : <Register />}
                />
                <Route
                  path="/register/username/password"
                  element={<PasswordRegisterWithUsername />}
                />
                <Route path="/register/:method" element={<SecondaryRegister />} />

                {/* Forgot password */}
                <Route path="/forgot-password/reset" element={<ResetPassword />} />
                <Route path="/forgot-password/:method" element={<ForgotPassword />} />

                {/* Continue set up missing profile */}
                <Route
                  path="/continue/email-or-phone/:method"
                  element={<ContinueWithEmailOrPhone />}
                />
                <Route path="/continue/:method" element={<Continue />} />

                {/* Social sign-in pages */}
                <Route path="/callback/:connectorId" element={<Callback />} />
                <Route path="/social/link/:connectorId" element={<SocialLinkAccount />} />
                <Route path="/social/landing/:connectorId" element={<SocialLanding />} />

                {/* Always keep route path with param as the last one */}
                <Route path="/:type/:method/verification-code" element={<VerificationCode />} />
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
