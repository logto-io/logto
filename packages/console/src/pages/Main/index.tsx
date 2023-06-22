import { Component, GeneralEvent } from '@logto/app-insights/custom-event';
import { TrackOnce } from '@logto/app-insights/react';
import { useMemo } from 'react';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import { SWRConfig } from 'swr';

import { getBasename } from '@/consts';
import AppBoundary from '@/containers/AppBoundary';
import AppContent from '@/containers/AppContent';
import ConsoleContent from '@/containers/ConsoleContent';
import Toast from '@/ds-components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import Callback from '@/pages/Callback';
import Welcome from '@/pages/Welcome';

import HandleSocialCallback from '../Profile/containers/HandleSocialCallback';

function Main() {
  const swrOptions = useSwrOptions();

  const router = useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <Route path="/*">
            <Route path="callback" element={<Callback />} />
            <Route path="welcome" element={<Welcome />} />
            <Route path="handle-social" element={<HandleSocialCallback />} />
            <Route element={<AppContent />}>
              <Route path="*" element={<ConsoleContent />} />
            </Route>
          </Route>
        ),
        // Currently we use `window.open()` to navigate between tenants so the `useMemo` hook
        // can have no dependency and the router will be created anyway. Consider integrating the
        // tenant ID into the router and remove basename here if we want to use `history.pushState()`
        // to navigate.
        //
        // Caveat: To use `history.pushState()`, we'd better to create a browser router in the upper
        // level of the component tree to make the tenant ID a part of the URL. Otherwise, we need
        // to handle `popstate` event to update the tenant ID when the user navigates back.
        { basename: getBasename() }
      ),
    []
  );

  return (
    <SWRConfig value={swrOptions}>
      <AppBoundary>
        <TrackOnce component={Component.Console} event={GeneralEvent.Visit} />
        <Toast />
        <RouterProvider router={router} />
      </AppBoundary>
    </SWRConfig>
  );
}

export default Main;
