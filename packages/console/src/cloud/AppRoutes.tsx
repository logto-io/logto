import { Route, Routes } from 'react-router-dom';

import ProtectedRoutes from '@/containers/ProtectedRoutes';
import { GlobalAnonymousRoute } from '@/contexts/TenantsProvider';
import Callback from '@/pages/Callback';

import * as styles from './AppRoutes.module.scss';
import Main from './pages/Main';
import SocialDemoCallback from './pages/SocialDemoCallback';

/** Renders necessary routes when the user is not in a tenant context. */
function AppRoutes() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path={GlobalAnonymousRoute.Callback} element={<Callback />} />
        <Route path={GlobalAnonymousRoute.SocialDemoCallback} element={<SocialDemoCallback />} />
        <Route element={<ProtectedRoutes />}>
          <Route index element={<Main />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
