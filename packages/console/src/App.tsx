import { UserScope } from '@logto/core-kit';
import { LogtoProvider, Prompt, useLogto } from '@logto/react';
import {
  adminConsoleApplicationId,
  defaultTenantId,
  PredefinedScope,
  TenantScope,
} from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import { PostHogProvider, usePostHog } from 'posthog-js/react';
import { useContext, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import 'overlayscrollbars/overlayscrollbars.css';
import './scss/normalized.scss';
import './scss/overlayscrollbars.scss';
// eslint-disable-next-line import/no-unassigned-import
import '@fontsource/roboto-mono';
// eslint-disable-next-line import/no-unassigned-import
import 'react-color-palette/css';

import CloudAppRoutes from '@/cloud/AppRoutes';
import AppLoading from '@/components/AppLoading';
import { isCloud, postHogHost, postHogUiHost, postHogKey } from '@/consts/env';
import { cloudApi, getManagementApi, meApi } from '@/consts/resources';
import { ConsoleRoutes } from '@/containers/ConsoleRoutes';

import { GlobalScripts } from './components/Conversion';
import { adminTenantEndpoint, mainTitle } from './consts';
import ErrorBoundary from './containers/ErrorBoundary';
import LogtoErrorBoundary from './containers/LogtoErrorBoundary';
import AppConfirmModalProvider from './contexts/AppConfirmModalProvider';
import AppDataProvider, { AppDataContext } from './contexts/AppDataProvider';
import { AppThemeProvider } from './contexts/AppThemeProvider';
import TenantsProvider, { TenantsContext } from './contexts/TenantsProvider';
import Toast from './ds-components/Toast';
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
      UserScope.Profile,
      UserScope.Email,
      UserScope.Identities,
      UserScope.CustomData,
      UserScope.Organizations,
      UserScope.OrganizationRoles,
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
    <PostHogProvider
      apiKey={postHogKey ?? ''} // Empty key will disable PostHog
      options={{
        ui_host: postHogUiHost,
        api_host: postHogHost,
        defaults: '2025-05-24',
      }}
    >
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
          <Helmet titleTemplate={`%s - ${mainTitle}`} defaultTitle={mainTitle} />
          <Toast />
          <AppConfirmModalProvider>
            <ErrorBoundary>
              <LogtoErrorBoundary>
                <AppDataProvider>
                  <GlobalScripts />
                  <Content />
                </AppDataProvider>
              </LogtoErrorBoundary>
            </ErrorBoundary>
          </AppConfirmModalProvider>
        </AppThemeProvider>
      </LogtoProvider>
    </PostHogProvider>
  );
}

function Content() {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { isLoaded, user } = useCurrentUser();
  const { isAuthenticated } = useLogto();
  const { currentTenantId, currentTenant } = useContext(TenantsContext);
  const postHog = usePostHog();

  useEffect(() => {
    if (isLoaded) {
      postHog.identify(user?.id);
    }
    // We don't reset user info here because this component includes some anonymous pages.
    // Resetting user info may cause issues when the user switches between anonymous and
    // authenticated pages.
    // Reset user info in the sign-out logic instead.
  }, [isLoaded, postHog, user]);

  /**
   * The `useEffect` below sets the PostHog group properties based on:
   *
   * 1. If `currentTenant` is available, since it contains rich data, set the group with both ID
   *   and necessary properties.
   * 2. If only `currentTenantId` is available, set the group with only ID. This usually happens
   *   when the URL contains a tenant ID but the tenant data is not loaded yet or the tenant is
   *   unavailable to the user.
   * 3. If neither is available, reset all group properties. This usually happens when the user is
   *   not in a tenant context.
   *
   * @caveat
   * We need to identify group when window is reactivated (tab switch or window switch)
   * since one user may access different tenants in different tabs or windows.
   *
   * Currently, PostHog DOES capture the correct group when the user switches tabs or windows
   * since it reads the properties from the memory if existing, but just in case it doesn't work
   * in the future, we add this logic here.
   *
   * See {https://github.com/PostHog/posthog-js/blob/b5eb605/packages/core/src/posthog-core-stateless.ts#L778-L783 | posthog-js source code}
   * for details at the time of writing.
   */
  useEffect(() => {
    const captureGroups = () => {
      if (currentTenant) {
        postHog.group('tenant', currentTenantId, {
          name: currentTenant.name,
        });
      } else if (currentTenantId) {
        postHog.group('tenant', currentTenantId);
      } else {
        postHog.resetGroups();
      }
    };

    captureGroups();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        captureGroups();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [postHog, currentTenantId, currentTenant]);

  /**
   * If it's not Cloud (OSS), render the tenant app container directly since only default tenant is available;
   * if it's Cloud, render the tenant app container only when a tenant ID is available (in a tenant context).
   */
  if (!isCloud || currentTenantId) {
    // Authenticated user should load onboarding data before rendering the app.
    // This looks weird and it can be refactored by merging the onboarding
    // routes with the console routes.
    if (!tenantEndpoint || (isCloud && isAuthenticated && !isLoaded)) {
      return <AppLoading />;
    }

    return <ConsoleRoutes />;
  }

  return <CloudAppRoutes />;
}
