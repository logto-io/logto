import { conditional } from '@silverhand/essentials';
import { Navigate, Route, Routes } from 'react-router-dom';

import useUserOnboardingData from '@/cloud/hooks/use-user-onboarding-data';
import { OnboardPage } from '@/cloud/types';
import { getOnboardPagePathname } from '@/cloud/utils';
import Topbar from '@/containers/AppLayout/components/Topbar';
import NotFound from '@/pages/NotFound';

import About from '../About';
import Congrats from '../Congrats';
import SignInExperience from '../SignInExperience';
import Welcome from '../Welcome';
import * as styles from './index.module.scss';

const welcomePathname = getOnboardPagePathname(OnboardPage.Welcome);

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
      <Topbar />
      <Routes>
        <Route index element={<Navigate replace to={welcomePathname} />} />
        <Route path={OnboardPage.Welcome} element={<Welcome />} />
        <Route
          path={OnboardPage.AboutUser}
          element={
            conditional(questionnaire && <About />) ?? <Navigate replace to={welcomePathname} />
          }
        />
        <Route
          path={OnboardPage.SignInExperience}
          element={
            conditional(questionnaire && <SignInExperience />) ?? (
              <Navigate replace to={welcomePathname} />
            )
          }
        />
        <Route
          path={OnboardPage.Congrats}
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
