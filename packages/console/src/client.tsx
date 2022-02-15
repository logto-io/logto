import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

// eslint-disable-next-line unicorn/prefer-module
const render = module.hot ? ReactDOM.render : ReactDOM.hydrate;

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.querySelector('#root')
);

/* eslint-disable unicorn/prefer-module */
if (module.hot) {
  module.hot.accept();
}
/* eslint-enable unicorn/prefer-module */
