import { conditional } from '@silverhand/essentials';
import { Navigate, Route, Routes } from 'react-router-dom';

import useUserOnboardingData from '@/cloud/hooks/use-user-onboarding-data';
import { CloudPage } from '@/cloud/types';
import { getCloudPagePathname } from '@/cloud/utils';
import NotFound from '@/pages/NotFound';

import About from '../About';
import Congrats from '../Congrats';
import Welcome from '../Welcome';
import * as styles from './index.module.scss';

const welcomePathname = getCloudPagePathname(CloudPage.Welcome);

const Onboard = () => {
  const {
    data: { questionnaire },
    isLoaded,
  } = useUserOnboardingData();

  if (!isLoaded) {
    return null;
  }

  return (
    <div className={styles.onBoard}>
      <Routes>
        <Route index element={<Navigate replace to={welcomePathname} />} />
        <Route path={CloudPage.Welcome} element={<Welcome />} />
        <Route
          path={CloudPage.AboutUser}
          element={
            conditional(questionnaire && <About />) ?? <Navigate replace to={welcomePathname} />
          }
        />
        <Route
          path={CloudPage.Congrats}
          element={
            conditional(questionnaire && <Congrats />) ?? <Navigate replace to={welcomePathname} />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default Onboard;
