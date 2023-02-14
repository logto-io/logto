import { useContext, useEffect } from 'react';

import SwitchIcon from '@/assets/icons/switch-icon.svg';
import TextLink from '@/components/TextLink';
import { PageContext } from '@/hooks/use-page-context';
import useSendVerificationCode from '@/hooks/use-send-verification-code';
import type { VerificationCodeIdentifier } from '@/types';
import { UserFlow } from '@/types';

type Props = {
  className?: string;
  identifier: VerificationCodeIdentifier;
  value: string;
};

const VerificationCodeLink = ({ className, identifier, value }: Props) => {
  const { setToast } = useContext(PageContext);

  const { errorMessage, clearErrorMessage, onSubmit } = useSendVerificationCode(
    UserFlow.signIn,
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
