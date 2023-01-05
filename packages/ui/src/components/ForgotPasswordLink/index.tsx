import type { SignInIdentifier } from '@logto/schemas';

import TextLink from '@/components/TextLink';
import { UserFlow } from '@/types';

type Props = {
  method: SignInIdentifier.Email | SignInIdentifier.Phone;
  className?: string;
};

const ForgotPasswordLink = ({ method, className }: Props) => (
  <TextLink
    className={className}
    to={`/${UserFlow.forgotPassword}/${method}`}
    text="action.forgot_password"
  />
);

export default ForgotPasswordLink;
