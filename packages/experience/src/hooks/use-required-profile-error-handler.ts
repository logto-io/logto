import { InteractionEvent, MissingProfile } from '@logto/schemas';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserFlow, SearchParameters, type ContinueFlowInteractionEvent } from '@/types';
import { missingProfileErrorDataGuard } from '@/types/guard';
import { queryStringify } from '@/utils';

import type { ErrorHandlers } from './use-error-handler';
import useToast from './use-toast';

export type Options = {
  replace?: boolean;
  linkSocial?: string;
  /**
   * We use this param to track the current profile fulfillment flow.
   * If is UserFlow.Register, we need to call the identify endpoint after the user completes the profile.
   * If is UserFlow.SignIn, directly call the submitInteraction endpoint.
   **/
  interactionEvent?: ContinueFlowInteractionEvent;
};

const useRequiredProfileErrorHandler = ({
  replace,
  linkSocial,
  interactionEvent = InteractionEvent.SignIn,
}: Options = {}) => {
  const navigate = useNavigate();
  const { setToast } = useToast();

  const requiredProfileErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_profile': (error) => {
        const [, data] = validate(error.data, missingProfileErrorDataGuard);

        // Required as a sign up method but missing in the user profile
        const missingProfile = data?.missingProfile[0];

        const linkSocialQueryString = linkSocial
          ? `?${queryStringify({ [SearchParameters.LinkSocial]: linkSocial })}`
          : undefined;

        switch (missingProfile) {
          case MissingProfile.password:
          case MissingProfile.username: {
            navigate(
              {
                pathname: `/${UserFlow.Continue}/${missingProfile}`,
              },
              { replace, state: { interactionEvent } }
            );
            break;
          }
          case MissingProfile.email:
          case MissingProfile.phone:
          case MissingProfile.emailOrPhone: {
            navigate(
              {
                pathname: `/${UserFlow.Continue}/${missingProfile}`,
                search: linkSocialQueryString,
              },
              { replace, state: { interactionEvent } }
            );
            break;
          }
          case MissingProfile.extraProfile: {
            navigate(
              {
                pathname: `/${UserFlow.Continue}/extra-profile`,
              },
              { replace, state: { interactionEvent } }
            );
            break;
          }

          default: {
            setToast(error.message);
            break;
          }
        }
      },
    }),
    [interactionEvent, linkSocial, navigate, replace, setToast]
  );

  return requiredProfileErrorHandler;
};

export default useRequiredProfileErrorHandler;
