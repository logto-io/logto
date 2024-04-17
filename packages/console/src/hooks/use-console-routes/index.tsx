import { condArray } from '@silverhand/essentials';
import { useMemo } from 'react';
import { type RouteObject } from 'react-router-dom';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import Dashboard from '@/pages/Dashboard';
import GetStarted from '@/pages/GetStarted';
import Mfa from '@/pages/Mfa';
import NotFound from '@/pages/NotFound';
import OrganizationGuide from '@/pages/Organizations/Guide';
import SigningKeys from '@/pages/SigningKeys';

import { apiResources } from './routes/api-resources';
import { applications } from './routes/applications';
import { auditLogs } from './routes/audit-logs';
import { connectors } from './routes/connectors';
import { customizeJwt } from './routes/customize-jwt';
import { enterpriseSso } from './routes/enterprise-sso';
import { organizationTemplate } from './routes/organization-template';
import { organizations } from './routes/organizations';
import { profile } from './routes/profile';
import { roles } from './routes/roles';
import { signInExperience } from './routes/sign-in-experience';
import { useTenantSettings } from './routes/tenant-settings';
import { users } from './routes/users';
import { webhooks } from './routes/webhooks';

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
        { path: 'mfa', element: <Mfa /> },
        connectors,
        enterpriseSso,
        webhooks,
        users,
        auditLogs,
        roles,
        isDevFeaturesEnabled && organizationTemplate,
        organizations,
        !isDevFeaturesEnabled && { path: 'organization-guide/*', element: <OrganizationGuide /> },
        profile,
        { path: 'signing-keys', element: <SigningKeys /> },
        isCloud && tenantSettings,
        isCloud && isDevFeaturesEnabled && customizeJwt
      ),
    [tenantSettings]
  );

  return routeObjects;
};
