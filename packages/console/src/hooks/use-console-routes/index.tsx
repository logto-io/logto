import { condArray } from '@silverhand/essentials';
import { useMemo } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import Dashboard from '@/pages/Dashboard';
import GetStarted from '@/pages/GetStarted';
import Mfa from '@/pages/Mfa';
import NotFound from '@/pages/NotFound';
import OrganizationGuide from '@/pages/Organizations/Guide';
import Introduction from '@/pages/Organizations/Guide/Introduction';
import OrganizationInfo from '@/pages/Organizations/Guide/OrganizationInfo';
import OrganizationPermissions from '@/pages/Organizations/Guide/OrganizationPermissions';
import OrganizationRoles from '@/pages/Organizations/Guide/OrganizationRoles';
import { steps } from '@/pages/Organizations/Guide/const';
import SigningKeys from '@/pages/SigningKeys';

import { apiResources } from './routes/api-resources';
import { applications } from './routes/applications';
import { auditLogs } from './routes/audit-logs';
import { connectors } from './routes/connectors';
import { customizeJwt } from './routes/customize-jwt';
import { enterpriseSso } from './routes/enterprise-sso';
import { organizationTemplate } from './routes/organization-template';
import { organizations } from './routes/organizations';
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
        !isDevFeaturesEnabled && {
          path: 'organization-guide/*',
          element: <OrganizationGuide />,
          children: [
            { index: true, element: <Navigate replace to={steps.introduction} /> },
            { path: steps.introduction, element: <Introduction /> },
            { path: steps.permissions, element: <OrganizationPermissions /> },
            { path: steps.roles, element: <OrganizationRoles /> },
            { path: steps.organizationInfo, element: <OrganizationInfo /> },
          ],
        },
        { path: 'signing-keys', element: <SigningKeys /> },
        isCloud && tenantSettings,
        isCloud && customizeJwt
      ),
    [tenantSettings]
  );

  return routeObjects;
};
