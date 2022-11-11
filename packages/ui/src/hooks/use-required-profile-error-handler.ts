import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserFlow } from '@/types';

const useRequiredProfileErrorHandler = (replace?: boolean) => {
  const navigate = useNavigate();

  const requiredProfileErrorHandler = useMemo(
    () => ({
      'user.require_password': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/password`,
            search: location.search,
          },
          { replace }
        );
      },
      'user.require_username': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/username`,
            search: location.search,
          },
          { replace }
        );
      },
      'user.require_email': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/email`,
            search: location.search,
          },
          { replace }
        );
      },
      'user.require_sms': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/sms`,
            search: location.search,
          },
          { replace }
        );
      },
      'user.require_email_or_sms': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/email-or-sms/email`,
            search: location.search,
          },
          { replace }
        );
      },
    }),
    [navigate, replace]
  );

  return requiredProfileErrorHandler;
};

export default useRequiredProfileErrorHandler;
