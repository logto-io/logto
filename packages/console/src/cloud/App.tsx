import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProtectedContent from '@/containers/ProtectedRoutes';
import Callback from '@cloud/pages/Callback';

import * as styles from './App.module.scss';
import Main from './pages/Main';
import SocialDemoCallback from './pages/SocialDemoCallback';

function App() {
  return (
    <BrowserRouter>
      <div className={styles.app}>
        <Routes>
          <Route path="/callback" element={<Callback />} />
          <Route path="/social-demo-callback" element={<SocialDemoCallback />} />
          <Route path="/:tenantId/callback" element={<Callback />} />
          <Route path="/*" element={<ProtectedContent />}>
            <Route path="*" element={<Main />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
