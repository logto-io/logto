import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import Toast from '@/components/Toast';
import { getBasename } from '@/consts';
import AppBoundary from '@/containers/AppBoundary';
import AppContent from '@/containers/AppContent';
import ConsoleContent from '@/containers/ConsoleContent';
import useSwrOptions from '@/hooks/use-swr-options';
import Callback from '@/pages/Callback';
import Welcome from '@/pages/Welcome';

import HandleSocialCallback from '../Profile/containers/HandleSocialCallback';

function Main() {
  const swrOptions = useSwrOptions();

  return (
    <BrowserRouter basename={getBasename()}>
      <SWRConfig value={swrOptions}>
        <AppBoundary>
          <Toast />
          <Routes>
            <Route path="callback" element={<Callback />} />
            <Route path="welcome" element={<Welcome />} />
            <Route path="handle-social" element={<HandleSocialCallback />} />
            <Route element={<AppContent />}>
              <Route path="/*" element={<ConsoleContent />} />
            </Route>
          </Routes>
        </AppBoundary>
      </SWRConfig>
    </BrowserRouter>
  );
}

export default Main;
