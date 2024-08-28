import { useEffect } from 'react';

import SwitchIcon from '@/assets/icons/switch-icon.svg';
import TextLink from '@/components/TextLink';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import useToast from '@/hooks/use-toast';
import type { VerificationCodeIdentifier } from '@/types';
import { UserFlow } from '@/types';

type Props = {
  readonly className?: string;
  readonly identifier: VerificationCodeIdentifier;
  readonly value: string;
};

const VerificationCodeLink = ({ className, identifier, value }: Props) => {
  const { setToast } = useToast();

  const { errorMessage, clearErrorMessage, onSubmit } = useSendVerificationCode(
    UserFlow.SignIn,
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
      icon={<SwitchIcon />}
      onClick={() => {
        clearErrorMessage();
        void onSubmit({ identifier, value });
      }}
    />
  );
};

export default VerificationCodeLink;
