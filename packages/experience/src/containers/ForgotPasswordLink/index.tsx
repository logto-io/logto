import type { SignInIdentifier } from '@logto/schemas';

import TextLink from '@/components/TextLink';
import { UserFlow } from '@/types';

type Props = {
  readonly identifier?: SignInIdentifier;
  readonly value?: string;
  readonly className?: string;
};

const ForgotPasswordLink = ({ className, ...identifierData }: Props) => (
  <TextLink
    className={className}
    to={{
      pathname: `/${UserFlow.ForgotPassword}`,
    }}
    state={identifierData}
    text="action.forgot_password"
  />
);

export default ForgotPasswordLink;
