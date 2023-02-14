import { MissingProfile } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useLocation, useParams } from 'react-router-dom';
import { validate } from 'superstruct';

import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { continueFlowStateGuard } from '@/types/guard';

import SetEmailOrPhone from './SetEmailOrPhone';
import SetPassword from './SetPassword';
import SetUsername from './SetUsername';

type Parameters = {
  method?: string;
};

const Continue = () => {
  const { method = '' } = useParams<Parameters>();
  const { state } = useLocation();

  const [_, data] = validate(state, continueFlowStateGuard);

  const notification = conditional(
    data?.flow === UserFlow.signIn && 'description.continue_with_more_information'
  );

  if (method === MissingProfile.password) {
    return <SetPassword notification={notification} />;
  }

  if (method === MissingProfile.username) {
    return <SetUsername notification={notification} />;
  }

  if (
    method === MissingProfile.email ||
    method === MissingProfile.phone ||
    method === MissingProfile.emailOrPhone
  ) {
    return <SetEmailOrPhone notification={notification} missingProfile={method} />;
  }

  return <ErrorPage />;
};

export default Continue;
