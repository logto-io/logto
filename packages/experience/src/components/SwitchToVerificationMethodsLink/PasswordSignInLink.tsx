import TextLink from '@/components/TextLink';
import SwitchIcon from '@/shared/assets/icons/switch-icon.svg?react';
import { UserFlow } from '@/types';

type Props = {
  readonly className?: string;
};

const PasswordSignInLink = ({ className }: Props) => {
  return (
    <TextLink
      replace
      className={className}
      icon={<SwitchIcon />}
      text="action.sign_in_via_password"
      to={`/${UserFlow.SignIn}/password`}
    />
  );
};

export default PasswordSignInLink;
