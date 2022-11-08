import { SignInIdentifier } from '@logto/schemas';

import TextLink from '@/components/TextLink';
import { UserFlow } from '@/types';

type Props = {
  className?: string;
  method: SignInIdentifier.Email | SignInIdentifier.Sms;
  target: string;
};

const PasswordSignInLink = ({ className, method, target }: Props) => {
  return (
    <TextLink
      replace
      className={className}
      text="action.sign_in_via_password"
      to={`/${UserFlow.signIn}/${method}/password`}
      state={method === SignInIdentifier.Email ? { email: target } : { phone: target }}
    />
  );
};

export default PasswordSignInLink;
