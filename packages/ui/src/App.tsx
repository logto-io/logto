import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import AppContent from './components/AppContent';
import useTheme from './hooks/use-theme';
import initI18n from './i18n/init';
import Callback from './pages/Callback';
import Consent from './pages/Consent';
import Passcode from './pages/Passcode';
import Register from './pages/Register';
import SecondarySignIn from './pages/SecondarySignIn';
import SignIn from './pages/SignIn';
import './scss/normalized.scss';

void initI18n();

const App = () => {
  const theme = useTheme();

  return (
    <AppContent theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* always keep route path with param as the last one */}
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-in/consent" element={<Consent />} />
          <Route path="/sign-in/:channel" element={<SecondarySignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:channel" element={<Register />} />
          <Route path="/:type/:channel/passcode-validation" element={<Passcode />} />
          <Route path="/callback/:connector" element={<Callback />} />
        </Routes>
      </BrowserRouter>
    </AppContent>
  );
};

export default App;
