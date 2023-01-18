import { MissingProfile } from '@logto/schemas';
import { useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserFlow, SearchParameters } from '@/types';
import { missingProfileErrorDataGuard } from '@/types/guard';
import { queryStringify } from '@/utils';

import type { ErrorHandlers } from './use-api';
import { PageContext } from './use-page-context';

type Options = {
  replace?: boolean;
  linkSocial?: string;
};

const useRequiredProfileErrorHandler = ({ replace, linkSocial }: Options = {}) => {
  const navigate = useNavigate();
  const { setToast } = useContext(PageContext);

  const requiredProfileErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_profile': (error) => {
        const [, data] = validate(error.data, missingProfileErrorDataGuard);
        const missingProfile = data?.missingProfile[0];

        const linkSocialQueryString = linkSocial
          ? `?${queryStringify({ [SearchParameters.linkSocial]: linkSocial })}`
          : undefined;

        switch (missingProfile) {
          case MissingProfile.password:
          case MissingProfile.username:
            navigate(
              {
                pathname: `/${UserFlow.continue}/${missingProfile}`,
              },
              { replace }
            );
            break;
          case MissingProfile.email:
          case MissingProfile.phone:
            navigate(
              {
                pathname: `/${UserFlow.continue}/${missingProfile}`,
                search: linkSocialQueryString,
              },
              { replace }
            );
            break;
          case MissingProfile.emailOrPhone:
            navigate(
              {
                pathname: `/${UserFlow.continue}/email-or-phone/email`,
                search: linkSocialQueryString,
              },
              { replace }
            );
            break;

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
