import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppThemeProvider } from '@/contexts/AppThemeProvider';
import Callback from '@cloud/pages/Callback';

import * as styles from './App.module.scss';
import Main from './pages/Main';
import { CloudRoute } from './types';

const App = () => (
  <BrowserRouter>
    <AppThemeProvider>
      <div className={styles.app}>
        <Routes>
          <Route path={`/${CloudRoute.Callback}`} element={<Callback />} />
          <Route path={`/:tenantId/${CloudRoute.Callback}`} element={<Callback />} />
          <Route path="/*" element={<Main />} />
        </Routes>
      </div>
    </AppThemeProvider>
  </BrowserRouter>
);

export default App;
