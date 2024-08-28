import { MissingProfile } from '@logto/schemas';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserFlow, SearchParameters } from '@/types';
import { missingProfileErrorDataGuard } from '@/types/guard';
import { queryStringify } from '@/utils';

import type { ErrorHandlers } from './use-error-handler';
import useToast from './use-toast';

export type Options = {
  replace?: boolean;
  linkSocial?: string;
};

const useRequiredProfileErrorHandler = ({ replace, linkSocial }: Options = {}) => {
  const navigate = useNavigate();
  const { setToast } = useToast();

  const requiredProfileErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_profile': (error) => {
        const [, data] = validate(error.data, missingProfileErrorDataGuard);

        // Required as a sign up method but missing in the user profile
        const missingProfile = data?.missingProfile[0];

        // Required as a sign up method, verified email or phone can be found in Social Identity, but registered with a different account
        const registeredSocialIdentity = data?.registeredSocialIdentity;

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
              { replace }
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
              { replace, state: { registeredSocialIdentity } }
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
    [linkSocial, navigate, replace, setToast]
  );

  return requiredProfileErrorHandler;
};

export default useRequiredProfileErrorHandler;
