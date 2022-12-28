import { MissingProfile } from '@logto/schemas';
import { useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { validate } from 'superstruct';

import { UserFlow } from '@/types';
import { missingProfileErrorDataGuard } from '@/types/guard';

import type { ErrorHandlers } from './use-api';
import { PageContext } from './use-page-context';

const useRequiredProfileErrorHandler = (replace?: boolean) => {
  const navigate = useNavigate();
  const { setToast } = useContext(PageContext);

  const requiredProfileErrorHandler = useMemo<ErrorHandlers>(
    () => ({
      'user.missing_profile': (error) => {
        const [, data] = validate(error.data, missingProfileErrorDataGuard);
        const missingProfile = data?.missingProfile[0];

        switch (missingProfile) {
          case MissingProfile.password:
          case MissingProfile.username:
          case MissingProfile.email:
            navigate(
              {
                pathname: `/${UserFlow.continue}/${missingProfile}`,
                search: location.search,
              },
              { replace }
            );
            break;
          case MissingProfile.phone:
            navigate(
              {
                pathname: `/${UserFlow.continue}/sms`,
                search: location.search,
              },
              { replace }
            );
            break;
          case MissingProfile.emailOrPhone:
            navigate(
              {
                pathname: `/${UserFlow.continue}/email-or-sms/email`,
                search: location.search,
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
    [navigate, replace, setToast]
  );

  return requiredProfileErrorHandler;
};

export default useRequiredProfileErrorHandler;
