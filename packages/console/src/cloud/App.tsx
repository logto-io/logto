import { BrowserRouter, Route, Routes } from 'react-router-dom';

import * as styles from './App.module.scss';
import Main from './pages/Main';
import Onboard from './pages/Onboard';
import { CloudRoute } from './types';

const App = () => {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path={CloudRoute.Onboard + '/*'} element={<Onboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
