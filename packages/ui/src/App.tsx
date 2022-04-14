import React, { useState, useMemo, useEffect } from 'react';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';

import AppContent from './components/AppContent';
import PageContext from './hooks/page-context';
import initI18n from './i18n/init';
import Callback from './pages/Callback';
import Consent from './pages/Consent';
import Passcode from './pages/Passcode';
import Register from './pages/Register';
import SecondarySignIn from './pages/SecondarySignIn';
import SignIn from './pages/SignIn';
import { SignInExperienceSettings } from './types';
import getSignInExperienceSettings from './utils/sign-in-experience';

import './scss/normalized.scss';

void initI18n();

const App = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [experienceSettings, setExperienceSettings] = useState<SignInExperienceSettings>();

  const context = useMemo(
    () => ({ toast, loading, experienceSettings, setLoading, setToast, setExperienceSettings }),
    [experienceSettings, loading, toast]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      // TODO: error handling
      const { settings } = await getSignInExperienceSettings();
      setExperienceSettings(settings);
      setLoading(false);
    })();
  }, []);

  if (!experienceSettings) {
    return null;
  }

  return (
    <PageContext.Provider value={context}>
      <AppContent>
        <BrowserRouter>
          <Routes>
            {/* always keep route path with param as the last one */}
            <Route path="/" element={<Navigate replace to="/sign-in" />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-in/consent" element={<Consent />} />
            <Route path="/sign-in/:method" element={<SecondarySignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/:method" element={<Register />} />
            <Route path="/:type/:method/passcode-validation" element={<Passcode />} />
            <Route path="/callback/:connector" element={<Callback />} />
          </Routes>
        </BrowserRouter>
      </AppContent>
    </PageContext.Provider>
  );
};

export default App;
