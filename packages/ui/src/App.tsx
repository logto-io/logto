import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import AppContent from './components/AppContent';
import useTheme from './hooks/use-theme';
import initI18n from './i18n/init';
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
        <Switch>
          <Route exact path="/sign-in" component={SignIn} />
          <Route exact path="/sign-in/consent" component={Consent} />
          <Route exact path="/sign-in/:channel" component={SecondarySignIn} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/register/:channel" component={Register} />
          <Route exact path="/:type/:channel/passcode-validation" component={Passcode} />
        </Switch>
      </BrowserRouter>
    </AppContent>
  );
};

export default App;
