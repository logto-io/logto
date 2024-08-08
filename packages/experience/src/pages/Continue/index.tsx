import { MissingProfile } from '@logto/schemas';
import { useLocation, useParams } from 'react-router-dom';
import { validate } from 'superstruct';

import ErrorPage from '@/pages/ErrorPage';
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

  const [, continueFlowState] = validate(state, continueFlowStateGuard);

  if (!continueFlowState) {
    return <ErrorPage title="error.invalid_session" rawMessage="flow state not found" />;
  }

  const { interactionEvent } = continueFlowState;

  if (method === MissingProfile.password) {
    return <SetPassword interactionEvent={interactionEvent} />;
  }

  if (method === MissingProfile.username) {
    return <SetUsername interactionEvent={interactionEvent} />;
  }

  if (
    method === MissingProfile.email ||
    method === MissingProfile.phone ||
    method === MissingProfile.emailOrPhone
  ) {
    return <SetEmailOrPhone missingProfile={method} interactionEvent={interactionEvent} />;
  }

  return <ErrorPage />;
};

export default Continue;
