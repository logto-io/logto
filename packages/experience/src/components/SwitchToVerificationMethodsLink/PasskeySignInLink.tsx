import TextLink from '@/components/TextLink';
import useStartIdentifierPasskeySignInProcessing from '@/hooks/use-start-identifier-passkey-sign-in-processing';
import SwitchIcon from '@/shared/assets/icons/switch-icon.svg?react';
import { type VerificationCodeIdentifier } from '@/types';

type Props = {
  readonly className?: string;
  readonly identifier: VerificationCodeIdentifier;
  readonly value: string;
};

const PasskeySignInLink = ({ className, identifier, value }: Props) => {
  const { startProcessing: onClickPasskeySignInMethod, isProcessing } =
    useStartIdentifierPasskeySignInProcessing({
      hideErrorToast: false,
    });

  return (
    <TextLink
      replace
      className={className}
      icon={<SwitchIcon />}
      text="action.sign_in_via_passkey"
      onClick={async () => {
        if (isProcessing) {
          return;
        }
        await onClickPasskeySignInMethod({ type: identifier, value });
      }}
    />
  );
};

export default PasskeySignInLink;
