import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';

import AppContent from './components/AppContent';
import usePageContext from './hooks/use-page-context';
import initI18n from './i18n/init';
import Callback from './pages/Callback';
import Consent from './pages/Consent';
import NotFound from './pages/NotFound';
import Passcode from './pages/Passcode';
import Register from './pages/Register';
import SecondarySignIn from './pages/SecondarySignIn';
import SignIn from './pages/SignIn';
import SocialRegister from './pages/SocialRegister';
import getSignInExperienceSettings from './utils/sign-in-experience';

import './scss/normalized.scss';

const App = () => {
  const { context, Provider } = usePageContext();
  const { experienceSettings, setLoading, setExperienceSettings } = context;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const settings = await getSignInExperienceSettings();

      // Note: i18n must be initialized ahead of global experience settings
      await initI18n(settings.languageInfo);

      setExperienceSettings(settings);

      setLoading(false);
    })();
  }, [setExperienceSettings, setLoading]);

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
            <Route path="/sign-in/callback/:connector" element={<SignIn />} />
            <Route path="/sign-in/:method" element={<SecondarySignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/:method" element={<Register />} />
            <Route path="/callback/:connector" element={<Callback />} />
            <Route path="/social-register/:connector" element={<SocialRegister />} />
            <Route path="/:type/:method/passcode-validation" element={<Passcode />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppContent>
    </Provider>
  );
};

export default App;
