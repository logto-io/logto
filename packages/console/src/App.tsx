import { LogtoProvider, useLogto } from '@logto/react';
import { AppearanceMode, Setting } from '@logto/schemas';
import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import useSWR, { SWRConfig } from 'swr';
import './scss/normalized.scss';

import * as styles from './App.module.scss';
import AppContent from './components/AppContent';
import { getPath, sections } from './components/AppContent/components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { themeStorageKey, logtoApiResource } from './consts';
import { RequestError } from './hooks/use-api';
import useSwrFetcher from './hooks/use-swr-fetcher';
import initI18n from './i18n/init';
import ApiResourceDetails from './pages/ApiResourceDetails';
import ApiResources from './pages/ApiResources';
import ApplicationDetails from './pages/ApplicationDetails';
import Applications from './pages/Applications';
import Callback from './pages/Callback';
import ConnectorDetails from './pages/ConnectorDetails';
import Connectors from './pages/Connectors';
import GetStarted from './pages/GetStarted';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import SignInExperience from './pages/SignInExperience';
import UserDetails from './pages/UserDetails';
import Users from './pages/Users';

const isBasenameNeeded = process.env.NODE_ENV !== 'development' || process.env.PORT === '5002';

void initI18n();
const defaultTheme = localStorage.getItem(themeStorageKey) ?? AppearanceMode.SyncWithSystem;

const Main = () => {
  const { isAuthenticated } = useLogto();
  const location = useLocation();
  const navigate = useNavigate();
  const fetcher = useSwrFetcher();

  const settingsFetcher = useSwrFetcher<Setting>();
  const { data } = useSWR<Setting, RequestError>(
    isAuthenticated && '/api/settings',
    settingsFetcher
  );

  useEffect(() => {
    const theme = data?.adminConsole.appearanceMode ?? defaultTheme;
    const isFollowSystem = theme === AppearanceMode.SyncWithSystem;
    const className = styles[theme] ?? '';

    if (!isFollowSystem) {
      document.body.classList.add(className);
    }

    return () => {
      if (!isFollowSystem) {
        document.body.classList.remove(className);
      }
    };
  }, [data?.adminConsole.appearanceMode]);

  useEffect(() => {
    (async () => {
      void initI18n(data?.adminConsole.language);
    })();
  }, [data?.adminConsole.language]);

  useEffect(() => {
    if (location.pathname === '/') {
      navigate(getPath(sections[0]?.items[0]?.title ?? ''));
    }
  }, [location.pathname, navigate]);

  return (
    <ErrorBoundary>
      <SWRConfig value={{ fetcher }}>
        <Toast />
        <Routes>
          <Route path="callback" element={<Callback />} />
          <Route element={<AppContent />}>
            <Route path="*" element={<NotFound />} />
            <Route path="get-started" element={<GetStarted />} />
            <Route path="applications">
              <Route index element={<Applications />} />
              <Route path=":id">
                <Route index element={<Navigate to="settings" />} />
                <Route path="settings" element={<ApplicationDetails />} />
                <Route path="advanced-settings" element={<ApplicationDetails />} />
              </Route>
            </Route>
            <Route path="api-resources">
              <Route index element={<ApiResources />} />
              <Route path=":id" element={<ApiResourceDetails />} />
            </Route>
            <Route path="connectors">
              <Route index element={<Connectors />} />
              <Route path="social" element={<Connectors />} />
              <Route path=":connectorId" element={<ConnectorDetails />} />
            </Route>
            <Route path="users">
              <Route index element={<Users />} />
              <Route path=":id" element={<UserDetails />} />
            </Route>
            <Route path="sign-in-experience">
              <Route index element={<Navigate to="experience" />} />
              <Route path=":tab" element={<SignInExperience />} />
            </Route>
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </SWRConfig>
    </ErrorBoundary>
  );
};

const App = () => (
  <BrowserRouter basename={isBasenameNeeded ? '/console' : ''}>
    <LogtoProvider
      config={{ endpoint: window.location.origin, appId: 'foo', resources: [logtoApiResource] }}
    >
      <Main />
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
