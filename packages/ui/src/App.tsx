import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AppContent from './components/AppContent';
import Home from './pages/Home';
import './scss/normalized.scss';

const App = () => (
  <AppContent theme="dark">
    <Switch>
      <Route exact path="/" component={Home} />
    </Switch>
  </AppContent>
);

export default App;
