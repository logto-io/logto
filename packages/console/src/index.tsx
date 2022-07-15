import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';

import App from './App';

const app = document.querySelector('#app');
ReactModal.setAppElement('#app');
ReactDOM.render(<App />, app);
