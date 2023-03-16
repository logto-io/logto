import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Callback from '@cloud/pages/Callback';

import * as styles from './App.module.scss';
import Main from './pages/Main';
import SocialDemoCallback from './pages/SocialDemoCallback';
import { CloudRoute } from './types';

const App = () => {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Routes>
          <Route path={`/${CloudRoute.Callback}`} element={<Callback />} />
          <Route path={`/${CloudRoute.SocialDemoCallback}`} element={<SocialDemoCallback />} />
          <Route path={`/:tenantId/${CloudRoute.Callback}`} element={<Callback />} />
          <Route path="/*" element={<Main />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
