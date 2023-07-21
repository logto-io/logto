import { Route, Routes } from 'react-router-dom';

import ProtectedRoutes from '@/containers/ProtectedRoutes';
import Callback from '@/pages/Callback';

import * as styles from './AppRoutes.module.scss';
import Main from './pages/Main';
import SocialDemoCallback from './pages/SocialDemoCallback';

/** Renders necessary routes when the user is not in a tenant context. */
function AppRoutes() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/callback" element={<Callback />} />
        <Route path="/social-demo-callback" element={<SocialDemoCallback />} />
        <Route path="/:tenantId/callback" element={<Callback />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="*" element={<Main />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
