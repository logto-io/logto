/* eslint-disable-next-line import/no-unassigned-import, unicorn/no-unnecessary-polyfills -- polyfill by design */
import 'core-js/actual';
import { createRoot } from 'react-dom/client';
import ReactModal from 'react-modal';

import App from './App';

const app = document.querySelector('#app');
const root = app && createRoot(app);
ReactModal.setAppElement('#app');
root?.render(<App />);
