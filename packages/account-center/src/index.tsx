import { createRoot } from 'react-dom/client';
import ReactModal from 'react-modal';

import App from './App';

const app = document.querySelector<HTMLElement>('#app');

if (app) {
  ReactModal.setAppElement(app);
}

const root = app && createRoot(app);
root?.render(<App />);
