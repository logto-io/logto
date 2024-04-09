import { Route, Routes } from 'react-router-dom';

import { isCloud } from '@/consts/env';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import { GlobalAnonymousRoute, GlobalRoute } from '@/contexts/TenantsProvider';
import AcceptInvitation from '@/pages/AcceptInvitation';
import Callback from '@/pages/Callback';
import CheckoutSuccessCallback from '@/pages/CheckoutSuccessCallback';

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
          {isCloud && (
            <Route
              path={`${GlobalRoute.AcceptInvitation}/:invitationId`}
              element={<AcceptInvitation />}
            />
          )}
          <Route path={GlobalRoute.CheckoutSuccessCallback} element={<CheckoutSuccessCallback />} />
          <Route index element={<Main />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
