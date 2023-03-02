import { UserScope } from '@logto/core-kit';
import { LogtoProvider } from '@logto/react';
import { adminConsoleApplicationId, PredefinedScope } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import { useContext } from 'react';

import 'overlayscrollbars/styles/overlayscrollbars.css';
import './scss/normalized.scss';
import './scss/overlayscrollbars.scss';

// eslint-disable-next-line import/no-unassigned-import
import '@fontsource/roboto-mono';

import CloudApp from '@/cloud/App';
import { cloudApi, getManagementApi, meApi } from '@/consts/resources';
import initI18n from '@/i18n/init';

import { adminTenantEndpoint } from './consts';
import { isCloud } from './consts/cloud';
import ErrorBoundary from './containers/ErrorBoundary';
import AppConfirmModalProvider from './contexts/AppConfirmModalProvider';
import AppEndpointsProvider from './contexts/AppEndpointsProvider';
import TenantsProvider, { TenantsContext } from './contexts/TenantsProvider';
import Main from './pages/Main';

void initI18n();

const Content = () => {
  const { tenants, isSettle, currentTenantId } = useContext(TenantsContext);

  const resources = deduplicate([
    // Explicitly add `currentTenantId` and deduplicate since the user may directly
    // access a URL with Tenant ID, adding the ID from the URL here can possibly remove one
    // additional redirect.
    ...(currentTenantId && [getManagementApi(currentTenantId).indicator]),
    ...(tenants ?? []).map(({ id }) => getManagementApi(id).indicator),
    ...(isCloud ? [cloudApi.indicator] : []),
    meApi.indicator,
  ]);
  const scopes = [
    UserScope.Email,
    UserScope.Identities,
    UserScope.CustomData,
    PredefinedScope.All,
    cloudApi.scopes.CreateTenant, // It's fine to keep scope here since core will filter
  ];

  return (
    <LogtoProvider
      config={{
        endpoint: adminTenantEndpoint,
        appId: adminConsoleApplicationId,
        resources,
        scopes,
      }}
    >
      {!isCloud || isSettle ? (
        <AppEndpointsProvider>
          <AppConfirmModalProvider>
            <Main />
          </AppConfirmModalProvider>
        </AppEndpointsProvider>
      ) : (
        <CloudApp />
      )}
    </LogtoProvider>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <TenantsProvider>
        <Content />
      </TenantsProvider>
    </ErrorBoundary>
  );
};
export default App;
