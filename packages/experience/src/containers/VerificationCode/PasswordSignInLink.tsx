import type { SignInIdentifier } from '@logto/schemas';

import SwitchIcon from '@/assets/icons/switch-icon.svg';
import TextLink from '@/components/TextLink';
import { UserFlow } from '@/types';

type Props = {
  readonly className?: string;
  readonly method: SignInIdentifier.Email | SignInIdentifier.Phone;
  readonly target: string;
};

const PasswordSignInLink = ({ className, method, target }: Props) => {
  return (
    <TextLink
      replace
      className={className}
      icon={<SwitchIcon />}
      text="action.sign_in_via_password"
      to={`/${UserFlow.SignIn}/password`}
      state={{ identifier: method, value: target }}
    />
  );
};

export default PasswordSignInLink;
