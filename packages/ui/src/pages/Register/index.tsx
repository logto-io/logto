import { useContext } from 'react';

import LandingPageContainer from '@/containers/LandingPageContainer';
import { PageContext } from '@/hooks/use-page-context';

const Register = () => {
  const { experienceSettings } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  return <LandingPageContainer>signUp</LandingPageContainer>;
};

export default Register;
