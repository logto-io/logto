import { createRoot } from 'react-dom/client';
// eslint-disable-next-line import/no-unassigned-import
import '@logto/core-kit/declaration';

import App from './App';

const app = document.querySelector('#app');
const root = app && createRoot(app);
root?.render(<App />);
