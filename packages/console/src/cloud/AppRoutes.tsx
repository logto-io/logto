import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import DelayedSuspenseFallback from '@/components/DelayedSuspenseFallback';
import { EnterpriseSubscriptionTabs } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import { GlobalAnonymousRoute, GlobalRoute } from '@/contexts/TenantsProvider';
import { OnboardingApp } from '@/onboarding';
import AcceptInvitation from '@/pages/AcceptInvitation';
import Callback from '@/pages/Callback';
import CheckoutSuccessCallback from '@/pages/CheckoutSuccessCallback';
import ExternalGoogleOneTapLanding from '@/pages/ExternalGoogleOneTapLanding';
import OneTimeTokenLanding from '@/pages/OneTimeTokenLanding';
import Profile from '@/pages/Profile';
import HandleSocialCallback from '@/pages/Profile/containers/HandleSocialCallback';

import styles from './AppRoutes.module.scss';
import EnterpriseSubscription from './pages/EnterpriseSubscription';
import BillingHistory from './pages/EnterpriseSubscription/BillingHistory';
import Subscription from './pages/EnterpriseSubscription/Subscription';
import Main from './pages/Main';
import SocialDemoCallback from './pages/SocialDemoCallback';

/** Renders necessary routes when the user is not in a tenant context. */
function AppRoutes() {
  return (
    <div className={styles.app}>
      <Suspense fallback={<DelayedSuspenseFallback />}>
        <Routes>
          <Route path={GlobalAnonymousRoute.Callback} element={<Callback />} />
          <Route path={GlobalAnonymousRoute.SocialDemoCallback} element={<SocialDemoCallback />} />
          <Route
            path={GlobalAnonymousRoute.OneTimeTokenLanding}
            element={<OneTimeTokenLanding />}
          />
          <Route
            path={GlobalAnonymousRoute.ExternalGoogleOneTapLanding}
            element={<ExternalGoogleOneTapLanding />}
          />
          <Route element={<ProtectedRoutes />}>
            <Route
              path={`${GlobalRoute.AcceptInvitation}/:invitationId`}
              element={<AcceptInvitation />}
            />
            <Route path={GlobalRoute.Profile + '/*'} element={<Profile />} />
            <Route path={GlobalRoute.HandleSocial} element={<HandleSocialCallback />} />
            <Route
              path={GlobalRoute.CheckoutSuccessCallback}
              element={<CheckoutSuccessCallback />}
            />
            <Route path={GlobalRoute.Onboarding + '/*'} element={<OnboardingApp />} />
            <Route index element={<Main />} />
            {/* TODO: Remove dev features flag check when enterprise subscription is generally available */}
            {isDevFeaturesEnabled && (
              <Route
                path={`${GlobalRoute.EnterpriseSubscription}/:logtoEnterpriseId`}
                element={<EnterpriseSubscription />}
              >
                <Route
                  index
                  element={<Navigate replace to={EnterpriseSubscriptionTabs.Subscription} />}
                />
                <Route path={EnterpriseSubscriptionTabs.Subscription} element={<Subscription />} />
                <Route
                  path={EnterpriseSubscriptionTabs.BillingHistory}
                  element={<BillingHistory />}
                />
              </Route>
            )}
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default AppRoutes;
