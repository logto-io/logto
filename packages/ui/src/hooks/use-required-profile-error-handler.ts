import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserFlow } from '@/types';

const useRequiredProfileErrorHandler = (replace?: boolean) => {
  const navigate = useNavigate();

  const requiredProfileErrorHandler = useMemo(
    () => ({
      'user.password_required_in_profile': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/password`,
            search: location.search,
          },
          { replace }
        );
      },
      'user.username_required_in_profile': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/username`,
            search: location.search,
          },
          { replace }
        );
      },
      'user.email_required_in_profile': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/email`,
            search: location.search,
          },
          { replace }
        );
      },
      'user.phone_required_in_profile': () => {
        navigate(
          {
            pathname: `/${UserFlow.continue}/sms`,
            search: location.search,
          },
          { replace }
        );
      },
      'user.email_or_phone_required_in_profile': () => {
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
