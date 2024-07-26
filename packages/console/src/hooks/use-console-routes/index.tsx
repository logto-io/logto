import { condArray } from '@silverhand/essentials';
import { useMemo } from 'react';
import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { isCloud } from '@/consts/env';
import NotFound from '@/pages/NotFound';

import { apiResources } from './routes/api-resources';
import { applications } from './routes/applications';
import { auditLogs } from './routes/audit-logs';
import { connectors } from './routes/connectors';
import { customizeJwt } from './routes/customize-jwt';
import { enterpriseSso } from './routes/enterprise-sso';
import { mfa } from './routes/mfa';
import { organizationTemplate } from './routes/organization-template';
import { organizations } from './routes/organizations';
import { roles } from './routes/roles';
import { signInExperience } from './routes/sign-in-experience';
import { useTenantSettings } from './routes/tenant-settings';
import { users } from './routes/users';
import { webhooks } from './routes/webhooks';

const Dashboard = safeLazy(async () => import('@/pages/Dashboard'));
const GetStarted = safeLazy(async () => import('@/pages/GetStarted'));
const SigningKeys = safeLazy(async () => import('@/pages/SigningKeys'));

export const useConsoleRoutes = () => {
  const tenantSettings = useTenantSettings();

  const routeObjects: RouteObject[] = useMemo(
    () =>
      condArray<RouteObject | RouteObject[]>(
        { path: '*', element: <NotFound /> },
        { path: 'get-started', element: <GetStarted /> },
        { path: 'dashboard', element: <Dashboard /> },
        applications,
        apiResources,
        signInExperience,
        mfa,
        connectors,
        enterpriseSso,
        webhooks,
        users,
        auditLogs,
        roles,
        organizationTemplate,
        organizations,
        { path: 'signing-keys', element: <SigningKeys /> },
        isCloud && tenantSettings,
        customizeJwt
      ),
    [tenantSettings]
  );

  return routeObjects;
};
