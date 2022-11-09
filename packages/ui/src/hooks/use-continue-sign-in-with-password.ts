import { SignInIdentifier } from '@logto/schemas';
import { useNavigate } from 'react-router-dom';

import { UserFlow } from '@/types';

const useContinueSignInWithPassword = (method: SignInIdentifier.Email | SignInIdentifier.Sms) => {
  const navigate = useNavigate();

  return (value: string) => {
    navigate(
      {
        pathname: `/${UserFlow.signIn}/${method}/password`,
        search: location.search,
      },
      { state: method === SignInIdentifier.Email ? { email: value } : { phone: value } }
    );
  };
};

export default useContinueSignInWithPassword;
