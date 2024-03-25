import { AppInsightsBoundary } from '@logto/app-insights/react';
import { UserScope } from '@logto/core-kit';
import { LogtoProvider, Prompt, useLogto } from '@logto/react';
import {
  adminConsoleApplicationId,
  defaultTenantId,
  PredefinedScope,
  TenantScope,
} from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import 'overlayscrollbars/overlayscrollbars.css';
import './scss/normalized.scss';
import './scss/overlayscrollbars.scss';
// eslint-disable-next-line import/no-unassigned-import
import '@fontsource/roboto-mono';

import CloudAppRoutes from '@/cloud/AppRoutes';
import AppLoading from '@/components/AppLoading';
import { isCloud } from '@/consts/env';
import { cloudApi, getManagementApi, meApi } from '@/consts/resources';
import { ConsoleRoutes } from '@/containers/ConsoleRoutes';
import useTrackUserId from '@/hooks/use-track-user-id';
import { OnboardingRoutes } from '@/onboarding';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';

import { GlobalScripts } from './components/Conversion';
import { adminTenantEndpoint, mainTitle } from './consts';
import ErrorBoundary from './containers/ErrorBoundary';
import LogtoErrorBoundary from './containers/LogtoErrorBoundary';
import AppConfirmModalProvider from './contexts/AppConfirmModalProvider';
import AppDataProvider, { AppDataContext } from './contexts/AppDataProvider';
import { AppThemeProvider } from './contexts/AppThemeProvider';
import TenantsProvider, { TenantsContext } from './contexts/TenantsProvider';
import useCurrentUser from './hooks/use-current-user';
import initI18n from './i18n/init';

void initI18n();

/**
 * The main entry of the project. It provides two fundamental context providers:
 *
 * - `RouterProvider`: the sole router provider of the project.
 * - `TenantsProvider`: manages the tenants data, requires the `RouterProvider` to
 * get the current tenant ID from the URL.
 */
function App() {
  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <TenantsProvider>
          <Providers />
        </TenantsProvider>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

/**
 * This component serves as a container for all the providers and boundary components.
 *
 * Since `TenantsContext` requires the `TenantsProvider` to be mounted, and the initialization
 * of `LogtoProvider` requires the `TenantsContext` to be available, we have to put them into
 * different components.
 */
function Providers() {
  const { currentTenantId } = useContext(TenantsContext);

  // For Cloud, we use Management API proxy for accessing tenant data.
  // For OSS, we directly call the tenant API with the default tenant API resource.
  const resources = useMemo(
    () =>
      isCloud
        ? [cloudApi.indicator, meApi.indicator]
        : [getManagementApi(defaultTenantId).indicator, meApi.indicator],
    []
  );

  const scopes = useMemo(
    () => [
      UserScope.Email,
      UserScope.Identities,
      UserScope.CustomData,
      UserScope.Organizations,
      PredefinedScope.All,
      ...conditionalArray(
        isCloud && [
          ...Object.values(TenantScope),
          cloudApi.scopes.CreateTenant,
          cloudApi.scopes.ManageTenantSelf,
        ]
      ),
    ],
    []
  );

  return (
    <LogtoProvider
      unstable_enableCache
      config={{
        endpoint: adminTenantEndpoint.href,
        appId: adminConsoleApplicationId,
        resources,
        scopes,
        prompt: [Prompt.Login, Prompt.Consent],
      }}
    >
      <AppThemeProvider>
        <AppInsightsBoundary cloudRole="console">
          <Helmet titleTemplate={`%s - ${mainTitle}`} defaultTitle={mainTitle} />
          <ErrorBoundary>
            <LogtoErrorBoundary>
              {/**
               * If it's not Cloud (OSS), render the tenant app container directly since only default tenant is available;
               * if it's Cloud, render the tenant app container only when a tenant ID is available (in a tenant context).
               */}
              {!isCloud || currentTenantId ? (
                <AppDataProvider>
                  <AppConfirmModalProvider>
                    <AppRoutes />
                  </AppConfirmModalProvider>
                </AppDataProvider>
              ) : (
                <CloudAppRoutes />
              )}
            </LogtoErrorBoundary>
          </ErrorBoundary>
        </AppInsightsBoundary>
      </AppThemeProvider>
    </LogtoProvider>
  );
}

/** Renders different routes based on the user's onboarding status. */
function AppRoutes() {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { isLoaded } = useCurrentUser();
  const { isOnboarding } = useUserOnboardingData();
  const { isAuthenticated } = useLogto();

  useTrackUserId();

  // Authenticated user should load onboarding data before rendering the app.
  // This looks weird and it will be refactored soon by merging the onboarding
  // routes with the console routes.
  if (!tenantEndpoint || (isCloud && isAuthenticated && !isLoaded)) {
    return <AppLoading />;
  }

  return (
    <>
      <GlobalScripts />
      {isAuthenticated && isOnboarding ? <OnboardingRoutes /> : <ConsoleRoutes />}
    </>
  );
}
