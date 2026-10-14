import { InteractionEvent, MissingProfile } from '@logto/schemas';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { validate } from 'superstruct';

import { stepUpRoutes } from '@/constants/step-up';
import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';
import { continueFlowStateGuard } from '@/types/guard';

import SetEmailOrPhone from './SetEmailOrPhone';
import SetExtraProfile from './SetExtraProfile';
import SetPassword from './SetPassword';
import SetUsername from './SetUsername';

type Parameters = {
  method?: string;
};

const Continue = () => {
  const { method: requestedMethod = '' } = useParams<Parameters>();
  const { state, search } = useLocation();
  const { authenticationContext, isPureStepUp } = useStepUpContext();

  const [, continueFlowState] = validate(state, continueFlowStateGuard);
  const method =
    isPureStepUp && authenticationContext
      ? (authenticationContext.establishableMethods.find((method) => method === requestedMethod) ??
        authenticationContext.establishableMethods[0])
      : requestedMethod;

  if (isPureStepUp && !method) {
    return <Navigate replace to={{ pathname: stepUpRoutes.landing, search }} />;
  }

  const interactionEvent = isPureStepUp
    ? InteractionEvent.SignIn
    : continueFlowState?.interactionEvent;

  if (!interactionEvent) {
    return <ErrorPage title="error.invalid_session" rawMessage="flow state not found" />;
  }

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

  if (method === 'extra-profile') {
    return <SetExtraProfile interactionEvent={interactionEvent} />;
  }

  return <ErrorPage />;
};

export default Continue;
