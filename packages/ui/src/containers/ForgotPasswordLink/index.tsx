import type { SignInIdentifier } from '@logto/schemas';

import TextLink from '@/components/TextLink';
import { UserFlow } from '@/types';

type Props = {
  identifier: SignInIdentifier;
  value: string;
  className?: string;
};

const ForgotPasswordLink = ({ className, ...identifierData }: Props) => (
  <TextLink
    className={className}
    to={{
      pathname: `/${UserFlow.forgotPassword}`,
    }}
    state={identifierData}
    text="action.forgot_password"
  />
);

export default ForgotPasswordLink;
