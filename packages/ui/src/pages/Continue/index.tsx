import { SignInIdentifier } from '@logto/schemas';
import { useParams } from 'react-router-dom';

import ErrorPage from '@/pages/ErrorPage';

import SetPassword from './SetPassword';
import SetUsername from './SetUsername';

type Parameters = {
  method?: string;
};

const Continue = () => {
  const { method = '' } = useParams<Parameters>();

  if (method === 'password') {
    return <SetPassword />;
  }

  if (method === SignInIdentifier.Username) {
    return <SetUsername />;
  }

  // TODO: username, email, sms

  return <ErrorPage />;
};

export default Continue;
