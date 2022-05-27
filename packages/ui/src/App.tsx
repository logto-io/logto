import { conditionalString } from '@silverhand/essentials';
import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';

import * as styles from './App.module.scss';
import AppContent from './components/AppContent';
import { loadAppleSdk } from './hooks/use-apple-auth';
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
import SocialRegister from './pages/SocialRegister';
import SocialSignInCallback from './pages/SocialSignInCallback';
import getSignInExperienceSettings, { isAppleConnectorEnabled } from './utils/sign-in-experience';

import './scss/normalized.scss';

const App = () => {
  const { context, Provider } = usePageContext();
  const { experienceSettings, setLoading, setExperienceSettings } = context;
  const [isPreview] = usePreview(context);

  useEffect(() => {
    if (isPreview) {
      document.body.classList.add(conditionalString(styles.preview));

      return;
    }

    (async () => {
      const settings = await getSignInExperienceSettings();

      // Load Apple official SDK if Apple connector is enabled
      if (isAppleConnectorEnabled(settings)) {
        await loadAppleSdk();
      }

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
            {/* always keep route path with param as the last one */}
            <Route path="/" element={<Navigate replace to="/sign-in" />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-in/consent" element={<Consent />} />
            <Route path="/sign-in/callback/:connector" element={<SocialSignInCallback />} />
            <Route path="/sign-in/:method" element={<SecondarySignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/:method" element={<Register />} />
            <Route path="/callback/:connector" element={<Callback />} />
            <Route path="/social-register/:connector" element={<SocialRegister />} />
            <Route path="/:type/:method/passcode-validation" element={<Passcode />} />
            <Route
              path="/unknown-session"
              element={<ErrorPage message="error.invalid_session" />}
            />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </BrowserRouter>
      </AppContent>
    </Provider>
  );
};

export default App;
