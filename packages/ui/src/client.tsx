/* eslint-disable unicorn/prefer-module */
import React from 'react';
import { render, hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

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
