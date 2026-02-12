import TextLink from '@/components/TextLink';
import SwitchIcon from '@/shared/assets/icons/switch-icon.svg?react';
import type { VerificationCodeIdentifier } from '@/types';

import useVerificationCodeLink from './use-verification-code-link';

type Props = {
  readonly className?: string;
  readonly identifier: VerificationCodeIdentifier;
  readonly value: string;
};

const VerificationCodeLink = ({ className, identifier, value }: Props) => {
  const onSubmitHandler = useVerificationCodeLink();

  return (
    <TextLink
      className={className}
      text="action.sign_in_via_passcode"
      icon={<SwitchIcon />}
      onClick={() => {
        void onSubmitHandler({ identifier, value });
      }}
    />
  );
};

export default VerificationCodeLink;
