import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { EnterpriseSubscriptionTabs } from '@/consts';

const EnterpriseSubscription = safeLazy(async () => import('@/pages/EnterpriseSubscription'));
const Subscription = safeLazy(async () => import('@/pages/EnterpriseSubscription/Subscription'));
const BillingHistory = safeLazy(
  async () => import('@/pages/EnterpriseSubscription/BillingHistory')
);

export const enterpriseSubscriptionRoute: RouteObject = {
  path: '/enterprise-subscriptions',
  children: [
    {
      path: ':logtoEnterpriseId',
      element: <EnterpriseSubscription />,
      children: [
        {
          index: true,
          element: <Navigate replace to={EnterpriseSubscriptionTabs.Subscription} />,
        },
        {
          path: EnterpriseSubscriptionTabs.Subscription,
          element: <Subscription />,
        },
        {
          path: EnterpriseSubscriptionTabs.BillingHistory,
          element: <BillingHistory />,
        },
      ],
    },
  ],
};
