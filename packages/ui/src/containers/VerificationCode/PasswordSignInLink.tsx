import type { SignInIdentifier } from '@logto/schemas';

import SwitchIcon from '@/assets/icons/switch-icon.svg';
import TextLink from '@/components/TextLink';
import { UserFlow } from '@/types';

type Props = {
  className?: string;
  method: SignInIdentifier.Email | SignInIdentifier.Phone;
  target: string;
};

const PasswordSignInLink = ({ className, method, target }: Props) => {
  return (
    <TextLink
      replace
      className={className}
      icon={<SwitchIcon />}
      text="action.sign_in_via_password"
      to={`/${UserFlow.signIn}/${method}/password`}
      state={{ [method]: target }}
    />
  );
};

export default PasswordSignInLink;
