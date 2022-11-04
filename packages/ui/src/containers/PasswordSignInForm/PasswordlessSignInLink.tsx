import type { SignInIdentifier } from '@logto/schemas';
import { useContext, useEffect } from 'react';

import TextLink from '@/components/TextLink';
import { PageContext } from '@/hooks/use-page-context';
import usePasswordlessSendCode from '@/hooks/use-passwordless-send-code';
import { UserFlow } from '@/types';

type Props = {
  className?: string;
  method: SignInIdentifier.Email | SignInIdentifier.Sms;
  value: string;
};

const PasswordlessSignInLink = ({ className, method, value }: Props) => {
  const { setToast } = useContext(PageContext);

  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordlessSendCode(
    UserFlow.signIn,
    method,
    true
  );

  useEffect(() => {
    if (errorMessage) {
      setToast(errorMessage);
    }
  }, [errorMessage, setToast]);

  return (
    <TextLink
      className={className}
      text="action.sign_in_via_passcode"
      onClick={() => {
        clearErrorMessage();
        void onSubmit(value);
      }}
    />
  );
};

export default PasswordlessSignInLink;
