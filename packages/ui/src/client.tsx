/* eslint-disable unicorn/prefer-module */
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const render = module.hot ? ReactDOM.render : ReactDOM.hydrate;

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.querySelector('#root')
);

if (module.hot) {
  module.hot.accept();
}
