import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useLocation, useParams } from 'react-router-dom';
import { validate } from 'superstruct';

import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { continueFlowStateGuard } from '@/types/guard';

import SetEmail from './SetEmail';
import SetPassword from './SetPassword';
import SetPhone from './SetPhone';
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

  if (method === 'password') {
    return <SetPassword notification={notification} />;
  }

  if (method === SignInIdentifier.Username) {
    return <SetUsername notification={notification} />;
  }

  if (method === SignInIdentifier.Email) {
    return <SetEmail notification={notification} />;
  }

  if (method === SignInIdentifier.Phone) {
    return <SetPhone notification={notification} />;
  }

  return <ErrorPage />;
};

export default Continue;
