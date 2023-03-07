import { Navigate, Route, Routes } from 'react-router-dom';

import useUserOnboardingData from '@/cloud/hooks/use-user-onboarding-data';
import { OnboardingPage } from '@/cloud/types';
import { getOnboardPagePathname } from '@/cloud/utils';
import NotFound from '@/pages/NotFound';

import About from '../About';
import Congrats from '../Congrats';
import SignInExperience from '../SignInExperience';
import Welcome from '../Welcome';
import * as styles from './index.module.scss';

const welcomePathname = getOnboardPagePathname(OnboardingPage.Welcome);

const Onboarding = () => {
  const {
    data: { questionnaire },
    isLoaded,
  } = useUserOnboardingData();

  if (!isLoaded) {
    return null;
  }

  return (
    <div className={styles.onBoarding}>
      <Routes>
        <Route index element={<Navigate replace to={welcomePathname} />} />
        <Route path={OnboardingPage.Welcome} element={<Welcome />} />
        <Route
          path={OnboardingPage.AboutUser}
          element={questionnaire ? <About /> : <Navigate replace to={welcomePathname} />}
        />
        <Route
          path={OnboardingPage.SignInExperience}
          element={questionnaire ? <SignInExperience /> : <Navigate replace to={welcomePathname} />}
        />
        <Route
          path={OnboardingPage.Congrats}
          element={questionnaire ? <Congrats /> : <Navigate replace to={welcomePathname} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default Onboarding;
