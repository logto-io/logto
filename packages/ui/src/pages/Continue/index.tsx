import { useParams } from 'react-router-dom';

import ErrorPage from '@/pages/ErrorPage';

import SetPassword from './SetPassword';

type Parameters = {
  method?: string;
};

const Continue = () => {
  const { method = '' } = useParams<Parameters>();

  if (method === 'password') {
    return <SetPassword />;
  }

  // TODO: username, email, sms

  return <ErrorPage />;
};

export default Continue;
