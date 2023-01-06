import { SignInIdentifier } from '@logto/schemas';
import { useParams } from 'react-router-dom';

import ErrorPage from '@/pages/ErrorPage';

import SetEmail from './SetEmail';
import SetPassword from './SetPassword';
import SetPhone from './SetPhone';
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

  if (method === SignInIdentifier.Email) {
    return <SetEmail />;
  }

  if (method === SignInIdentifier.Phone) {
    return <SetPhone />;
  }

  return <ErrorPage />;
};

export default Continue;
