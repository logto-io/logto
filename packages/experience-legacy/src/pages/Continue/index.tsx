import { MissingProfile } from '@logto/schemas';
import { useParams } from 'react-router-dom';

import ErrorPage from '@/pages/ErrorPage';

import SetEmailOrPhone from './SetEmailOrPhone';
import SetPassword from './SetPassword';
import SetUsername from './SetUsername';

type Parameters = {
  method?: string;
};

const Continue = () => {
  const { method = '' } = useParams<Parameters>();

  if (method === MissingProfile.password) {
    return <SetPassword />;
  }

  if (method === MissingProfile.username) {
    return <SetUsername />;
  }

  if (
    method === MissingProfile.email ||
    method === MissingProfile.phone ||
    method === MissingProfile.emailOrPhone
  ) {
    return <SetEmailOrPhone missingProfile={method} />;
  }

  return <ErrorPage />;
};

export default Continue;
