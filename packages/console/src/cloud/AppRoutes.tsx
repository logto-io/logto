import { Route, Routes } from 'react-router-dom';

import ProtectedRoutes from '@/containers/ProtectedRoutes';
import { GlobalAnonymousRoute, GlobalRoute } from '@/contexts/TenantsProvider';
import { OnboardingApp } from '@/onboarding';
import AcceptInvitation from '@/pages/AcceptInvitation';
import Callback from '@/pages/Callback';
import CheckoutSuccessCallback from '@/pages/CheckoutSuccessCallback';
import Profile from '@/pages/Profile';
import HandleSocialCallback from '@/pages/Profile/containers/HandleSocialCallback';

import styles from './AppRoutes.module.scss';
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
          <Route
            path={`${GlobalRoute.AcceptInvitation}/:invitationId`}
            element={<AcceptInvitation />}
          />
          <Route path={GlobalRoute.Profile + '/*'} element={<Profile />} />
          <Route path={GlobalRoute.HandleSocial} element={<HandleSocialCallback />} />
          <Route path={GlobalRoute.CheckoutSuccessCallback} element={<CheckoutSuccessCallback />} />
          <Route path={GlobalRoute.Onboarding + '/*'} element={<OnboardingApp />} />
          <Route index element={<Main />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
