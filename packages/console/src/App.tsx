import { UserScope } from '@logto/core-kit';
import { LogtoProvider } from '@logto/react';
import { adminConsoleApplicationId, managementResource } from '@logto/schemas/lib/seeds';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import './scss/normalized.scss';
// eslint-disable-next-line import/no-unassigned-import
import '@fontsource/roboto-mono';
import AppBoundary from '@/components/AppBoundary';
import AppContent from '@/components/AppContent';
import ErrorBoundary from '@/components/ErrorBoundary';
import Toast from '@/components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import initI18n from '@/i18n/init';
import ApiResourceDetails from '@/pages/ApiResourceDetails';
import ApiResources from '@/pages/ApiResources';
import ApplicationDetails from '@/pages/ApplicationDetails';
import Applications from '@/pages/Applications';
import AuditLogDetails from '@/pages/AuditLogDetails';
import AuditLogs from '@/pages/AuditLogs';
import Callback from '@/pages/Callback';
import ConnectorDetails from '@/pages/ConnectorDetails';
import Connectors from '@/pages/Connectors';
import Dashboard from '@/pages/Dashboard';
import GetStarted from '@/pages/GetStarted';
import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import SignInExperience from '@/pages/SignInExperience';
import UserDetails from '@/pages/UserDetails';
import Users from '@/pages/Users';
import Welcome from '@/pages/Welcome';

import { ConnectorsTabs, SignInExperienceTabs, UserTabs } from './consts/page-tabs';
import { ActionPath, PagePath, Parameters } from './consts/pathnames';
import { getBasename } from './utilities/router';

void initI18n();

const Main = () => {
  const swrOptions = useSwrOptions();

  return (
    <ErrorBoundary>
      <SWRConfig value={swrOptions}>
        <AppBoundary>
          <Toast />
          <Routes>
            <Route path={PagePath.Callback} element={<Callback />} />
            <Route path={PagePath.Welcome} element={<Welcome />} />
            <Route element={<AppContent />}>
              <Route path="*" element={<NotFound />} />
              <Route path={PagePath.GetStarted} element={<GetStarted />} />
              <Route path={PagePath.Applications}>
                <Route index element={<Applications />} />
                <Route path={`${ActionPath.Create}`} element={<Applications />} />
                <Route path={`:${Parameters.Id}`} element={<ApplicationDetails />} />
              </Route>
              <Route path={PagePath.ApiResources}>
                <Route index element={<ApiResources />} />
                <Route path={`${ActionPath.Create}`} element={<ApiResources />} />
                <Route path={`:${Parameters.Id}`} element={<ApiResourceDetails />} />
              </Route>
              <Route path={PagePath.Connectors}>
                <Route index element={<Navigate replace to={ConnectorsTabs.Passwordless} />} />
                <Route path={`:${Parameters.Tab}`} element={<Connectors />} />
                <Route
                  path={`:${Parameters.Tab}/${ActionPath.Create}/:${Parameters.CreateType}`}
                  element={<Connectors />}
                />
                <Route
                  path={`:${Parameters.Tab}/:${Parameters.ConnectorId}`}
                  element={<ConnectorDetails />}
                />
              </Route>
              <Route path={PagePath.Users}>
                <Route index element={<Users />} />
                <Route
                  path={`:${Parameters.UserId}`}
                  element={<Navigate replace to={UserTabs.Details} />}
                />
                <Route
                  path={`:${Parameters.UserId}/${UserTabs.Details}`}
                  element={<UserDetails />}
                />
                <Route path={`:${Parameters.UserId}/${UserTabs.Logs}`} element={<UserDetails />} />
                <Route
                  path={`:${Parameters.UserId}/${UserTabs.Logs}/:${Parameters.LogId}`}
                  element={<AuditLogDetails />}
                />
              </Route>
              <Route path={PagePath.SignInExperience}>
                <Route index element={<Navigate replace to={SignInExperienceTabs.Branding} />} />
                <Route path={`:${Parameters.Tab}`} element={<SignInExperience />} />
              </Route>
              <Route path={PagePath.Settings} element={<Settings />} />
              <Route path={PagePath.AuditLogs}>
                <Route index element={<AuditLogs />} />
                <Route path={`:${Parameters.LogId}`} element={<AuditLogDetails />} />
              </Route>
              <Route path={PagePath.Dashboard} element={<Dashboard />} />
            </Route>
          </Routes>
        </AppBoundary>
      </SWRConfig>
    </ErrorBoundary>
  );
};

const App = () => (
  <BrowserRouter basename={getBasename('console', '5002')}>
    <LogtoProvider
      config={{
        endpoint: window.location.origin,
        appId: adminConsoleApplicationId,
        resources: [managementResource.indicator],
        scopes: [UserScope.Identities, UserScope.CustomData],
      }}
    >
      <Main />
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
