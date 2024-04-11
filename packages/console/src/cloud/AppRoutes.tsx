import { Route, Routes, useRoutes } from 'react-router-dom';

import ProtectedRoutes from '@/containers/ProtectedRoutes';
import { GlobalAnonymousRoute, GlobalRoute } from '@/contexts/TenantsProvider';
import { profile } from '@/hooks/use-console-routes/routes/profile';
import AcceptInvitation from '@/pages/AcceptInvitation';
import Callback from '@/pages/Callback';
import CheckoutSuccessCallback from '@/pages/CheckoutSuccessCallback';

import * as styles from './AppRoutes.module.scss';
import Main from './pages/Main';
import SocialDemoCallback from './pages/SocialDemoCallback';

/** Renders necessary routes when the user is not in a tenant context. */
function AppRoutes() {
  const profileRoutes = useRoutes(profile);

  return (
    <div className={styles.app}>
      <Routes>
        <Route path={GlobalAnonymousRoute.Callback} element={<Callback />} />
        <Route path={GlobalAnonymousRoute.SocialDemoCallback} element={<SocialDemoCallback />} />
        <Route element={<ProtectedRoutes />}>
          <Route
            path={`${GlobalRoute.AcceptInvitation}/:invitationId`}
            element={<AcceptInvitation />}
          />
          <Route path={GlobalRoute.Profile}>{profileRoutes}</Route>
          <Route path={GlobalRoute.CheckoutSuccessCallback} element={<CheckoutSuccessCallback />} />
          <Route index element={<Main />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
