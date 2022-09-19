import { useEffect } from 'react';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';

import AppContent from './containers/AppContent';
import LoadingLayerProvider from './containers/LoadingLayerProvider';
import usePageContext from './hooks/use-page-context';
import usePreview from './hooks/use-preview';
import initI18n from './i18n/init';
import Callback from './pages/Callback';
import Consent from './pages/Consent';
import ErrorPage from './pages/ErrorPage';
import Passcode from './pages/Passcode';
import Register from './pages/Register';
import SecondarySignIn from './pages/SecondarySignIn';
import SignIn from './pages/SignIn';
import SocialLanding from './pages/SocialLanding';
import SocialRegister from './pages/SocialRegister';
import SocialSignIn from './pages/SocialSignInCallback';
import getSignInExperienceSettings from './utils/sign-in-experience';

import './scss/normalized.scss';

const App = () => {
  const { context, Provider } = usePageContext();
  const { experienceSettings, setLoading, setExperienceSettings } = context;
  const [isPreview] = usePreview(context);

  useEffect(() => {
    if (isPreview) {
      return;
    }

    (async () => {
      const settings = await getSignInExperienceSettings();

      // Note: i18n must be initialized ahead of global experience settings
      await initI18n(settings.languageInfo);

      setExperienceSettings(settings);
    })();
  }, [isPreview, setExperienceSettings, setLoading]);

  if (!experienceSettings) {
    return null;
  }

  return (
    <Provider value={context}>
      <AppContent>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate replace to="/sign-in" />} />
            <Route path="/sign-in/consent" element={<Consent />} />
            <Route
              path="/unknown-session"
              element={<ErrorPage message="error.invalid_session" />}
            />

            <Route element={<LoadingLayerProvider />}>
              {/* sign-in */}
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-in/social/:connector" element={<SocialSignIn />} />
              <Route path="/sign-in/:method" element={<SecondarySignIn />} />

              {/* register */}
              <Route path="/register" element={<Register />} />
              <Route path="/register/:method" element={<Register />} />

              {/* forgot password */}
              {/**
               * WIP
               * <Route path="/forgot-password/:method" element={<ForgotPassword />} />
               */}

              {/* social sign-in pages */}

              <Route path="/callback/:connector" element={<Callback />} />
              <Route path="/social/register/:connector" element={<SocialRegister />} />
              <Route path="/social/landing/:connector" element={<SocialLanding />} />

              {/* always keep route path with param as the last one */}
              <Route path="/:type/:method/passcode-validation" element={<Passcode />} />
            </Route>

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </AppContent>
    </Provider>
  );
};

export default App;
