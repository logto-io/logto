import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import Toast from '@/components/Toast';
import { getBasename } from '@/consts';
import AppBoundary from '@/containers/AppBoundary';
import AppContent from '@/containers/AppContent';
import ConsoleContent from '@/containers/ConsoleContent';
import { AppThemeProvider } from '@/contexts/AppThemeProvider';
import useSwrOptions from '@/hooks/use-swr-options';
import useUserPreferences from '@/hooks/use-user-preferences';
import Callback from '@/pages/Callback';
import Welcome from '@/pages/Welcome';

import HandleSocialCallback from '../Profile/containers/HandleSocialCallback';

const Main = () => {
  const swrOptions = useSwrOptions();
  const {
    data: { themeAdaptionStrategy },
  } = useUserPreferences();

  return (
    <BrowserRouter basename={getBasename()}>
      <SWRConfig value={swrOptions}>
        <AppThemeProvider strategy={themeAdaptionStrategy}>
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
        </AppThemeProvider>
      </SWRConfig>
    </BrowserRouter>
  );
};

export default Main;
