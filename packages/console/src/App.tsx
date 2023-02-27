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

import { adminTenantEndpoint, getUserTenantId } from './consts';
import { isCloud } from './consts/cloud';
import AppEndpointsProvider from './contexts/AppEndpointsProvider';
import TenantsProvider, { TenantsContext } from './contexts/TenantsProvider';
import Main from './pages/Main';

void initI18n();

const Content = () => {
  const {
    tenants: { data, isSettle },
  } = useContext(TenantsContext);
  const currentTenantId = getUserTenantId();

  const resources = deduplicate([
    ...(currentTenantId && [getManagementApi(currentTenantId).indicator]),
    ...(data ?? []).map(({ id }) => getManagementApi(id).indicator),
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
      {!isCloud || (data && isSettle && currentTenantId) ? (
        <AppEndpointsProvider>
          <Main />
        </AppEndpointsProvider>
      ) : (
        <CloudApp />
      )}
    </LogtoProvider>
  );
};

const App = () => {
  return (
    <TenantsProvider>
      <Content />
    </TenantsProvider>
  );
};
export default App;
