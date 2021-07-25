import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AppContent from './components/AppContent';
import initI18n from './init/i18n';
import Consent from './pages/Consent';
import SignIn from './pages/SignIn';
import './scss/normalized.scss';

initI18n();

const App = () => (
  <AppContent theme="dark">
    <Switch>
      <Route exact path="/sign-in" component={SignIn} />
      <Route exact path="/sign-in/consent" component={Consent} />
    </Switch>
  </AppContent>
);

export default App;
