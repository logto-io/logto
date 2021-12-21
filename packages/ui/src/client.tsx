import React from 'react';
import { render, hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

/* eslint-disable unicorn/prefer-module */
const renderFunction = module.hot ? render : hydrate;

renderFunction(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.querySelector('#root')
);

if (module.hot) {
  module.hot.accept();
}
/* eslint-enable unicorn/prefer-module */
