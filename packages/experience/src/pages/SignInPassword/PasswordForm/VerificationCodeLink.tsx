import { useCallback, useEffect, useState } from 'react';

import TextLink from '@/components/TextLink';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import useToast from '@/hooks/use-toast';
import SwitchIcon from '@/shared/assets/icons/switch-icon.svg?react';
import type { VerificationCodeIdentifier } from '@/types';
import { UserFlow } from '@/types';

type Props = {
  readonly className?: string;
  readonly identifier: VerificationCodeIdentifier;
  readonly value: string;
};

const VerificationCodeLink = ({ className, identifier, value }: Props) => {
  const { setToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { errorMessage, clearErrorMessage, onSubmit } = useSendVerificationCode(
    UserFlow.SignIn,
    true
  );

  const onSubmitHandler = useCallback(
    async (...args: Parameters<typeof onSubmit>) => {
      if (isLoading) {
        return;
      }

      clearErrorMessage();
      setIsLoading(true);
      await onSubmit(...args);
      setIsLoading(false);
    },
    [clearErrorMessage, isLoading, onSubmit]
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
        void onSubmitHandler({ identifier, value });
      }}
    />
  );
};

export default VerificationCodeLink;
