import React from 'react';
import { Route, Switch } from 'react-router-dom';

import AppContent from './components/AppContent';
import useTheme from './hooks/use-theme';
import initI18n from './i18n/init';
import Consent from './pages/Consent';
import Register from './pages/Register';
import SignIn from './pages/SignIn';
import './scss/normalized.scss';

void initI18n();

const App = () => {
  const theme = useTheme();

  return (
    <AppContent theme={theme}>
      <Switch>
        <Route exact path="/sign-in/username-password" component={SignIn} />
        <Route exact path="/consent" component={Consent} />
        <Route exact path="/register/username-password" component={Register} />
      </Switch>
    </AppContent>
  );
};

export default App;
